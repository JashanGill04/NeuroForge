pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'neuroforge-backend'
        APP_PORT = '9000'
        BACKEND_URL = 'http://localhost:9000'
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
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Docker Build & Deploy') {
            steps {
                dir('Backend') {
                    sh 'docker build -t ${DOCKER_IMAGE} .'
                    sh 'docker rm -f ${DOCKER_IMAGE} || true'
                    sh 'docker run -d -p ${APP_PORT}:${APP_PORT} --name ${DOCKER_IMAGE} ${DOCKER_IMAGE}'
                }
            }
        }

        stage('Track Deployment') {
            steps {
                sh '''
                curl -X POST ${BACKEND_URL}/api/pipelines/webhook \
                  -H "Content-Type: application/json" \
                  -d "{
                        \\"projectId\\": 2,
                        \\"status\\": \\"SUCCESS\\",
                        \\"duration\\": 0,
                        \\"commitHash\\": \\"${GIT_COMMIT}\\",
                        \\"branch\\": \\"${GIT_BRANCH}\\",
                        \\"environment\\": \\"PRODUCTION\\",
                        \\"deploymentSuccess\\": true
                      }"
                '''
            }
        }
    }

    post {
        failure {
            sh '''
            curl -X POST ${BACKEND_URL}/api/pipelines/webhook \
              -H "Content-Type: application/json" \
              -d "{
                    \\"projectId\\": 2,
                    \\"status\\": \\"FAILED\\",
                    \\"duration\\": 0,
                    \\"commitHash\\": \\"${GIT_COMMIT}\\",
                    \\"branch\\": \\"${GIT_BRANCH}\\",
                    \\"environment\\": \\"PRODUCTION\\",
                    \\"deploymentSuccess\\": false
                  }"
            '''
            sh 'bash rollback.sh'
        }
    }
}