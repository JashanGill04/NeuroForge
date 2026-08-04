import groovy.transform.Field

@Field def stageResults = []
@Field def testPassed = 0
@Field def testFailed = 0
@Field def testSkipped = 0
@Field def testCoverage = 0.0

def recordStage(name, status, startTime) {
    def durationSeconds = ((System.currentTimeMillis() - startTime) / 1000) as int
    stageResults.add([name: name, status: status, durationSeconds: durationSeconds])
}

def parseTestSummary() {
    def summaryOutput = sh(
        script: '''
            passed=0; failed=0; skipped=0
            for f in target/surefire-reports/*.txt; do
                [ -e "$f" ] || continue
                line=$(grep "Tests run:" "$f" | head -1)
                run=$(echo "$line" | sed -n 's/.*Tests run: \\([0-9]*\\).*/\\1/p')
                fail=$(echo "$line" | sed -n 's/.*Failures: \\([0-9]*\\).*/\\1/p')
                err=$(echo "$line" | sed -n 's/.*Errors: \\([0-9]*\\).*/\\1/p')
                skip=$(echo "$line" | sed -n 's/.*Skipped: \\([0-9]*\\).*/\\1/p')
                run=${run:-0}; fail=${fail:-0}; err=${err:-0}; skip=${skip:-0}
                failed=$((failed + fail + err))
                skipped=$((skipped + skip))
                passed=$((passed + run - fail - err - skip))
            done
            echo "PASSED=$passed"
            echo "FAILED=$failed"
            echo "SKIPPED=$skipped"
        ''',
        returnStdout: true
    ).trim()

    summaryOutput.split('\n').each { line ->
        def parts = line.split('=')
        if (parts[0] == 'PASSED') testPassed = parts[1] as int
        if (parts[0] == 'FAILED') testFailed = parts[1] as int
        if (parts[0] == 'SKIPPED') testSkipped = parts[1] as int
    }
}

def sendWebhook(status, deploymentSuccess) {
    def stagesJson = stageResults.collect {
        """{"name": "${it.name}", "status": "${it.status}", "durationSeconds": ${it.durationSeconds}}"""
    }.join(',')

    def payload = """{
        "projectId": ${env.PROJECT_ID},
        "status": "${status}",
        "duration": 120,
        "commitHash": "${env.GIT_COMMIT}",
        "commitMessage": "${env.COMMIT_MSG?.replace('"', '\\"') ?: ''}",
        "branch": "origin/main",
        "environment": "${env.ENV_NAME}",
        "deploymentSuccess": ${deploymentSuccess},
        "triggerSource": "JENKINS",
        "stages": [${stagesJson}],
        "testSummary": {
            "passed": ${testPassed},
            "failed": ${testFailed},
            "skipped": ${testSkipped},
            "coveragePercent": ${testCoverage}
        },
        "deploymentInfo": {
            "imageTag": "${env.IMAGE_TAG ?: ''}",
            "podsRunning": ${deploymentSuccess ? 1 : 0},
            "podsTotal": 1,
            "cpuPercent": 0,
            "memoryPercent": 0
        }
    }"""

    writeFile file: 'payload.json', text: payload
    sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @payload.json"
}

pipeline {
    agent any

    tools {
        maven 'Maven 3'
    }

    environment {
        CONTROLLER_URL = 'http://host.docker.internal:9000/api/pipelines/webhook'
        PROJECT_ID = '1'
        ENV_NAME = 'STAGING'
        DEPLOY_PORT = '9001'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    def stageStart = System.currentTimeMillis()
                    checkout scm
                    env.COMMIT_MSG = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
                    recordStage('Checkout', 'SUCCESS', stageStart)
                }
            }
        }

        stage('Build Jar') {
            steps {
                script {
                    def stageStart = System.currentTimeMillis()
                    try {
                        dir('Backend') {
                            sh 'mvn clean package -DskipTests'
                        }
                        recordStage('Build', 'SUCCESS', stageStart)
                    } catch (e) {
                        recordStage('Build', 'FAILED', stageStart)
                        throw e
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    def stageStart = System.currentTimeMillis()
                    try {
                        dir('Backend') {
                            sh 'mvn test'
                        }
                        recordStage('Test', 'SUCCESS', stageStart)
                    } catch (e) {
                        recordStage('Test', 'FAILED', stageStart)
                        throw e
                    } finally {
                        dir('Backend') {
                            junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'
                            parseTestSummary()
                        }
                    }
                }
            }
        }

        stage('Build & Run Docker Container') {
            steps {
                script {
                    def stageStart = System.currentTimeMillis()
                    try {
                        dir('Backend') {
                            sh 'docker build -t neuroforge-service .'
                        }
                        sh 'docker rm -f neuroforge-container || true'
                        sh """
                        docker run -d -p ${DEPLOY_PORT}:9000 --network neuroforge_default \
                          -e SPRING_DATASOURCE_URL=jdbc:postgresql://neuroforge-postgres:5432/neuroforge_nexus \
                          -e SPRING_DATASOURCE_USERNAME=postgres \
                          -e SPRING_DATASOURCE_PASSWORD=kitcoek \
                          --name neuroforge-container neuroforge-service
                        """

                        sh """
                        attempt=1
                        max_attempts=15
                        while [ \$attempt -le \$max_attempts ]; do
                            if curl -s http://host.docker.internal:${DEPLOY_PORT}/ > /dev/null; then
                                echo "API is up!"
                                exit 0
                            fi
                            echo "Attempt \$attempt failed. Waiting 5 seconds..."
                            sleep 5
                            attempt=\$((attempt + 1))
                        done
                        echo "API failed to start in time."
                        exit 1
                        """

                        env.IMAGE_TAG = "neuroforge-service:${env.BUILD_NUMBER}"
                        recordStage('Docker', 'SUCCESS', stageStart)
                        recordStage('Deploy', 'SUCCESS', stageStart)
                    } catch (e) {
                        recordStage('Docker', 'FAILED', stageStart)
                        recordStage('Deploy', 'FAILED', stageStart)
                        throw e
                    }
                }
            }
        }

        stage('Notify API Controller') {
            steps {
                script {
                    sendWebhook('SUCCESS', true)
                }
            }
        }
    }

    post {
        failure {
            script {
                sendWebhook('FAILED', false)
            }
        }
    }
}