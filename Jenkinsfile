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
                
                // POSIX-compliant while loop for standard sh
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
                    def successPayload = """{"projectId": ${env.PROJECT_ID}, "status": "SUCCESS", "duration": 120, "commitHash": "${env.GIT_COMMIT}", "branch": "origin/main", "environment": "${env.ENV_NAME}", "deploymentSuccess": true}"""
                    writeFile file: 'success_payload.json', text: successPayload
                    
                    // Escaped double quotes to ensure they survive interpolation
                    sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @success_payload.json"
                }
            }
        }
    }
    
    post {
        failure {
            script {
                def failurePayload = """{"projectId": ${env.PROJECT_ID}, "status": "FAILED", "duration": 120, "commitHash": "${env.GIT_COMMIT}", "branch": "origin/main", "environment": "${env.ENV_NAME}", "deploymentSuccess": false}"""
                writeFile file: 'failure_payload.json', text: failurePayload
                
                // Escaped double quotes applied here as well
                sh "curl -X POST ${env.CONTROLLER_URL} -H \"Content-Type: application/json\" -d @failure_payload.json"
            }
        }
    }
}
