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
        // Jenkins itself runs inside a container, so "localhost" from a pipeline
        // step means the Jenkins container, not your host machine or any sibling
        // container. host.docker.internal reaches the host (works automatically
        // on Docker Desktop for Windows/Mac; on native Linux Docker it needs
        // --add-host=host.docker.internal:host-gateway on the Jenkins container).
        //
        // This targets port 9000 -- your docker-compose "backend" service, which is
        // what actually runs PipelineController/PipelineService and what the
        // frontend reads from. Port 8081 below is a SEPARATE standalone
        // "payment-service" container this same pipeline deploys -- it does not
        // have the pipeline-tracking DB, so the webhook must NOT go there.
        BACKEND_HOST = 'host.docker.internal:9000'
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
                    // mvnw (no .cmd) is the Linux/macOS Maven wrapper script.
                    // chmod +x guards against the executable bit being lost,
                    // which commonly happens when a repo is edited/committed on Windows.
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                dir('Backend') {
                    sh 'docker build -t payment-service .'
                    sh 'docker rm -f payment-service || true'
                    sh '''
                        docker run -d -p 8081:9000 --name payment-service \
                          -e KEYCLOAK_JWK_SET_URI=http://host.docker.internal:8080/realms/neuroforge-nexus/protocol/openid-connect/certs \
                          -e KEYCLOAK_ISSUER=http://host.docker.internal:8080/realms/neuroforge-nexus \
                          -e KAFKA_BOOTSTRAP_SERVERS=host.docker.internal:9092 \
                          -e DB_URL=jdbc:postgresql://host.docker.internal:5432/neuroforge_nexus \
                          -e DB_USERNAME=postgres \
                          -e DB_PASSWORD=kitcoek \
                          payment-service
                    '''
                }
            }
        }

        stage('Track Deployment') {
            steps {
                sleep time: 80, unit: 'SECONDS'

                script {
                    def branchName = (env.GIT_BRANCH ?: 'main').replaceFirst(/^origin\//, '')
                    def durationSeconds = ((currentBuild.duration ?: 0) as long).intdiv(1000)

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

                sh 'curl -sf -X POST http://${BACKEND_HOST}/api/pipelines/webhook -H "Content-Type: application/json" -d @pipeline-payload.json'
            }
        }
    }

    post {
        failure {
            sh 'docker stop payment-service || true'
            sh 'docker rm payment-service || true'

            // Also record the failed run so the KPI success-rate isn't skewed by
            // silently missing failed builds. Best-effort: '|| true' so a webhook
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
            sh 'curl -sf -X POST http://${BACKEND_HOST}/api/pipelines/webhook -H "Content-Type: application/json" -d @pipeline-payload-failure.json || true'
        }
    }
}