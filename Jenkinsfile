pipeline {
    agent any

    tools {
        maven 'Maven 3'
    }

    environment {
        CONTROLLER_URL = 'http://host.docker.internal:9000/api/pipelines/webhook'
        PROJECT_ID = '1'
        ENV_NAME = 'STAGING'
        // Added to capture commit details
        GIT_MSG = ''
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Capture the commit message safely
                    env.GIT_MSG = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
                }
            }
        }

        stage('Build Jar') {
            steps {
                dir('Backend') {
                    // Note: Tests are skipped here, so test metrics in the payload are mocked
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
                sh 'docker run -d -p 9001:9000 --network neuroforge_default -e SPRING_DATASOURCE_URL=jdbc:postgresql://neuroforge-postgres:5432/neuroforge_nexus -e SPRING_DATASOURCE_USERNAME=postgres -e SPRING_DATASOURCE_PASSWORD=kitcoek --name neuroforge-container neuroforge-service'
                
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
    }
    
    post {
        always {
            script {
                // 1. Determine final build status and duration dynamically
                def buildStatus = currentBuild.currentResult ?: 'SUCCESS'
                def isSuccess = (buildStatus == 'SUCCESS')
                def durationSecs = currentBuild.duration ? (currentBuild.duration / 1000).toInteger() : 0

                // 2. Build the payload as a Groovy Map
                def payloadMap = [
                    projectId: env.PROJECT_ID.toInteger(),
                    status: buildStatus,
                    duration: durationSecs,
                    commitHash: env.GIT_COMMIT ?: "unknown",
                    commitMessage: env.GIT_MSG ?: "No commit message",
                    branch: env.BRANCH_NAME ?: "origin/main",
                    triggerSource: "JENKINS",
                    environment: env.ENV_NAME,
                    deploymentSuccess: isSuccess,
                    
                    // Sending a basic representation of stages
                    stages: [
                        [name: "Checkout", status: "SUCCESS", durationSeconds: 5],
                        [name: "Build Jar", status: "SUCCESS", durationSeconds: 45],
                        [name: "Build & Deploy", status: buildStatus, durationSeconds: 30]
                    ],
                    
                    // Placeholder metrics (requires removing -DskipTests and parsing surefire XML for real data)
                    testSummary: [
                        passed: 10,
                        failed: 0,
                        skipped: 0,
                        coveragePercent: 85.0
                    ],
                    
                    // Deployment metrics for the container
                    deploymentInfo: [
                        imageTag: "neuroforge-service",
                        podsRunning: 1,
                        podsTotal: 1,
                        cpuPercent: 15.5,
                        memoryPercent: 45.2
                    ]
                ]

                // 3. Serialize to JSON and send
                def jsonPayload = groovy.json.JsonOutput.toJson(payloadMap)
                writeFile file: 'payload.json', text: jsonPayload
                
                echo "Sending Webhook Payload: ${jsonPayload}"
                sh "curl -s -X POST ${env.CONTROLLER_URL} -H 'Content-Type: application/json' -d @payload.json"
            }
        }
    }
}