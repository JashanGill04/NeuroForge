pipeline {
    agent any

    tools {
        maven 'Maven 3'
    }

    environment {
        CONTROLLER_URL = 'http://host.docker.internal:9000/api/pipelines/webhook'
        PROJECT_ID = '2'
        ENV_NAME = 'STAGING'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Tests') {
            steps {
                // 1. Spin up an isolated PostgreSQL container strictly for the test phase
                sh 'docker rm -f test-postgres || true'
                sh 'docker run -d --name test-postgres -p 5433:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=myrandompass -e POSTGRES_DB=neuroforge_nexus postgres:14'

                // 2. Give PostgreSQL 10 seconds to fully boot up and accept connections
                sh 'sleep 10'

                // 3. Run the tests mapped to this isolated database, passing the random password
                dir('Backend') {
                    sh 'mvn test -Dspring.datasource.url=jdbc:postgresql://host.docker.internal:5433/neuroforge_nexus -Dspring.datasource.username=postgres -Dspring.datasource.password=myrandompass -Dspring.jpa.hibernate.ddl-auto=create-drop -Dspring.jpa.defer-datasource-initialization=true'
                }
            }
            post {
                always {
                    // 4. Destroy the temporary database so it doesn't consume host resources
                    sh 'docker rm -f test-postgres || true'
                    junit 'Backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Build Jar') {
            steps {
                dir('Backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build & Run Docker Container') {
            steps {
                dir('Backend') {
                    sh 'docker build -t neuroforge-service .'
                }
                sh 'docker rm -f neuroforge-container || true'
                sh '''
                docker run -d --name neuroforge-container \
                    -p 9000:9000 \
                    --add-host=host.docker.internal:host-gateway \
                    neuroforge-service
                '''
                sh '''
                attempt=1
                max_attempts=15
                while [ $attempt -le $max_attempts ]; do
                    if curl -s http://host.docker.internal:9000/ > /dev/null; then
                        echo "API is up!"
                        exit 0
                    fi
                    echo "Attempt $attempt failed. Waiting 5 seconds..."
                    sleep 5
                    attempt=$((attempt + 1))
                done
                echo "API failed to start in time."
                docker logs neuroforge-container || true
                exit 1
                '''
            }
        }

        stage('Notify API Controller') {
            steps {
                script {
                    def counts = getTestCounts()
                    def successPayload = """{"projectId": ${env.PROJECT_ID}, "status": "SUCCESS", "duration": 120, "commitHash": "${env.GIT_COMMIT}", "branch": "origin/main", "environment": "${env.ENV_NAME}", "deploymentSuccess": true, "testsTotal": ${counts.total}, "testsPassed": ${counts.passed}, "testsFailed": ${counts.failed}, "testsSkipped": ${counts.skipped}}"""
                    writeFile file: 'success_payload.json', text: successPayload
                    sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @success_payload.json"
                }
            }
        }
    }

    post {
        failure {
            script {
                def counts = getTestCounts()
                def failurePayload = """{"projectId": ${env.PROJECT_ID}, "status": "FAILED", "duration": 120, "commitHash": "${env.GIT_COMMIT}", "branch": "origin/main", "environment": "${env.ENV_NAME}", "deploymentSuccess": false, "testsTotal": ${counts.total}, "testsPassed": ${counts.passed}, "testsFailed": ${counts.failed}, "testsSkipped": ${counts.skipped}}"""
                writeFile file: 'failure_payload.json', text: failurePayload
                sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @failure_payload.json"
            }
        }
        always {
            sh 'docker rm -f neuroforge-container || true'
        }
    }
}

// Parses surefire XML reports directly instead of using currentBuild.rawBuild.getAction(...),
// which is blocked by the Jenkins Groovy sandbox unless explicitly approved by an admin.
def getTestCounts() {
    def total = 0, failed = 0, skipped = 0
    def reportFiles = sh(
        script: "ls Backend/target/surefire-reports/*.xml 2>/dev/null || true",
        returnStdout: true
    ).trim()

    if (reportFiles) {
        reportFiles.split('\n').each { f ->
            def xml = readFile(f)
            def matcher = (xml =~ /<testsuite[^>]*\stests="(\d+)"[^>]*\sfailures="(\d+)"[^>]*\sskipped="(\d+)"/)
            if (matcher.find()) {
                total += matcher.group(1).toInteger()
                failed += matcher.group(2).toInteger()
                skipped += matcher.group(3).toInteger()
            }
        }
    }
    def passed = total - failed - skipped
    return [total: total, failed: failed, skipped: skipped, passed: passed]
}