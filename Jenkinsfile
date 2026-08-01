pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'payment-service'
        PORT = '8081'
        // TODO: set this to the actual Project row id for "payment-service" in Postgres.
        // The webhook 400s with "No project found with id X" if this is wrong.
        PIPELINE_PROJECT_ID = '1'
        // TODO: confirm this matches a real value of your DeploymentEnvironment enum.
        PIPELINE_ENVIRONMENT = 'STAGING'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build JAR') {
            steps {
                dir('Backend') {
                    bat 'mvnw.cmd clean package -DskipTests'
                }
            }
        }
        
        stage('Docker Build & Deploy') {
            steps {
                dir('Backend') {
                    bat 'docker build -t payment-service .'
                    bat 'docker rm -f payment-service || cmd /c "exit 0"'
                    bat 'docker run -d -p 8081:9000 --name payment-service -e KEYCLOAK_JWK_SET_URI=http://host.docker.internal:8080/realms/neuroforge-nexus/protocol/openid-connect/certs -e KEYCLOAK_ISSUER=http://host.docker.internal:8080/realms/neuroforge-nexus -e KAFKA_BOOTSTRAP_SERVERS=host.docker.internal:9092 -e DB_URL=jdbc:postgresql://host.docker.internal:5432/neuroforge_nexus -e DB_USERNAME=postgres -e DB_PASSWORD=kitcoek payment-service'
                }
            }
        }
        
        stage('Track Deployment') {
            steps {
                sleep time: 80, unit: 'SECONDS'

                script {
                    def branchName = (env.GIT_BRANCH ?: 'main').replaceFirst(/^origin\//, '')
                    def durationSeconds = ((currentBuild.duration ?: 0) as long).intdiv(1000)

                    // Build the JSON with Groovy's JsonOutput instead of a hand-escaped
                    // bat heredoc — the old inline "\"..\"" quoting is exactly what breaks
                    // silently on Windows when a value has a space or special char in it.
                    def payload = groovy.json.JsonOutput.toJson([
                        projectId       : (env.PIPELINE_PROJECT_ID as Long),
                        status          : 'SUCCESS',
                        duration        : durationSeconds,
                        commitHash      : env.GIT_COMMIT ?: 'unknown',
                        branch          : branchName,
                        environment     : env.PIPELINE_ENVIRONMENT,
                        deploymentSuccess: true
                    ])
                    writeFile file: 'pipeline-payload.json', text: payload
                }

                // NOTE: this now calls the REAL webhook that persists to Postgres,
                // not the old /api/track-deployment stub which discarded the payload.
                bat 'curl -X POST http://localhost:8081/api/pipelines/webhook -H "Content-Type: application/json" -d @pipeline-payload.json'
            }
        }
    }
    
    post {
        failure {
            bat "docker stop ${DOCKER_IMAGE} || cmd /c \"exit 0\""
            bat "docker rm ${DOCKER_IMAGE} || cmd /c \"exit 0\""

            // Also record the failed run so the KPI success-rate isn't skewed by
            // silently missing failed builds. Best-effort: '|| exit 0' so a webhook
            // hiccup never fails the pipeline's own failure handling.
            script {
                def branchName = (env.GIT_BRANCH ?: 'main').replaceFirst(/^origin\//, '')
                def durationSeconds = ((currentBuild.duration ?: 0) as long).intdiv(1000)
                def payload = groovy.json.JsonOutput.toJson([
                    projectId       : (env.PIPELINE_PROJECT_ID as Long),
                    status          : 'FAILED',
                    duration        : durationSeconds,
                    commitHash      : env.GIT_COMMIT ?: 'unknown',
                    branch          : branchName,
                    environment     : env.PIPELINE_ENVIRONMENT,
                    deploymentSuccess: false
                ])
                writeFile file: 'pipeline-payload-failure.json', text: payload
            }
            bat 'curl -X POST http://localhost:8081/api/pipelines/webhook -H "Content-Type: application/json" -d @pipeline-payload-failure.json || exit 0'
        }
    }
}