pipeline {
    agent any

    tools {
        maven 'Maven 3'
    }

    environment {
        CONTROLLER_URL = 'http://host.docker.internal:9000/api/pipelines/webhook'
        PROJECT_ID = '1'
        ENV_NAME = 'STAGING'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Tests') {
            // FIX 1: Provide the missing database credentials so Spring Boot can boot the context during tests.
            // If your test DB is hosted elsewhere (or requires a different URL), update the SPRING_DATASOURCE_URL.
            environment {
                SPRING_DATASOURCE_URL = 'jdbc:postgresql://host.docker.internal:5432/neuroforge_nexus' 
                SPRING_DATASOURCE_USERNAME = 'postgres'
                SPRING_DATASOURCE_PASSWORD = 'kitcoek'
            }
            steps {
                dir('Backend') {
                    sh 'mvn test'
                }
            }
            post {
                always {
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
                sh 'docker run -d -p 9000:9000 --network neuroforge_default -e SPRING_DATASOURCE_URL=jdbc:postgresql://neuroforge-postgres:5432/neuroforge_nexus -e SPRING_DATASOURCE_USERNAME=postgres -e SPRING_DATASOURCE_PASSWORD=kitcoek --name neuroforge-container neuroforge-service'

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
                exit 1
                '''
            }
        }

        stage('Notify API Controller') {
            steps {
                script {
                    // FIX 2: Correctly access the JUnit test results using currentBuild.rawBuild
                    def testAction = currentBuild.rawBuild?.getAction(hudson.tasks.junit.TestResultAction.class)
                    def totalTests = testAction ? testAction.getTotalCount() : 0
                    def failedTests = testAction ? testAction.getFailCount() : 0
                    def skippedTests = testAction ? testAction.getSkipCount() : 0
                    def passedTests = totalTests - failedTests - skippedTests

                    def successPayload = """{"projectId": ${env.PROJECT_ID}, "status": "SUCCESS", "duration": 120, "commitHash": "${env.GIT_COMMIT}", "branch": "origin/main", "environment": "${env.ENV_NAME}", "deploymentSuccess": true, "testsTotal": ${totalTests}, "testsPassed": ${passedTests}, "testsFailed": ${failedTests}, "testsSkipped": ${skippedTests}}"""
                    writeFile file: 'success_payload.json', text: successPayload

                    sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @success_payload.json"
                }
            }
        }
    }

    post {
        failure {
            script {
                // FIX 2 (Continued): Apply the same correction in the failure block
                def testAction = currentBuild.rawBuild?.getAction(hudson.tasks.junit.TestResultAction.class)
                def totalTests = testAction ? testAction.getTotalCount() : 0
                def failedTests = testAction ? testAction.getFailCount() : 0
                def skippedTests = testAction ? testAction.getSkipCount() : 0
                def passedTests = totalTests - failedTests - skippedTests

                def failurePayload = """{"projectId": ${env.PROJECT_ID}, "status": "FAILED", "duration": 120, "commitHash": "${env.GIT_COMMIT}", "branch": "origin/main", "environment": "${env.ENV_NAME}", "deploymentSuccess": false, "testsTotal": ${totalTests}, "testsPassed": ${passedTests}, "testsFailed": ${failedTests}, "testsSkipped": ${skippedTests}}"""
                writeFile file: 'failure_payload.json', text: failurePayload

                sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @failure_payload.json"
            }
        }
    }
}