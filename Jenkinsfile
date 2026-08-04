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
                    // Safely fetch commit message using Jenkins native changeSets
                    def commitMsg = ""
                    def changeLogSets = currentBuild.changeSets
                    if (changeLogSets != null && changeLogSets.size() > 0) {
                        def entries = changeLogSets[0].items
                        if (entries != null && entries.length > 0) {
                            commitMsg = entries[entries.length - 1].msg
                        }
                    }
                    // Fallback to a default if it's a manual build with no new commits
                    env.GIT_MSG = commitMsg ?: "Manual build (no new commits)"
                }
            }
        }

        stage('Build Jar') {
            steps {
                dir('Backend') {
                    // Note: Tests are skipped here, so test metrics in the payload are mocked
                    sh 'mvn clean test jacoco:report package'
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
            def buildStatus = currentBuild.currentResult ?: 'SUCCESS'
            def isSuccess = (buildStatus == 'SUCCESS')
            def durationSecs = currentBuild.duration ? (currentBuild.duration / 1000).toInteger() : 0

            // 1. Extract Real Test Metrics (From Surefire XML)
            def testsPassed = 0
            def testsFailed = 0
            def testsSkipped = 0
            
            try {
                // Greps the Surefire reports for the total counts
                def testStats = sh(script: '''
                    awk -F'"' '/<testsuite/ {tests+=$6; failures+=$8; errors+=$10; skipped+=$12} END {print tests","failures+errors","skipped}' Backend/target/surefire-reports/TEST-*.xml || echo "0,0,0"
                ''', returnStdout: true).trim().split(',')
                
                def totalTests = testStats[0].toInteger()
                testsFailed = testStats[1].toInteger()
                testsSkipped = testStats[2].toInteger()
                testsPassed = totalTests - testsFailed - testsSkipped
            } catch (Exception e) {
                echo "Could not parse test results: ${e.message}"
            }

            // 2. Extract Real Coverage (From JaCoCo CSV)
            def coverageVal = 0.0
            try {
                def covString = sh(script: '''
                    awk -F"," '{ instructions += $4 + $5; covered += $5 } END { if (instructions > 0) print (covered/instructions)*100; else print 0 }' Backend/target/site/jacoco/jacoco.csv || echo "0.0"
                ''', returnStdout: true).trim()
                coverageVal = covString.toDouble().round(2)
            } catch (Exception e) {
                echo "Could not parse coverage: ${e.message}"
            }

            // 3. Extract Real Docker Deployment Metrics
            def cpuUsage = 0.0
            def memUsage = 0.0
            def isRunning = 0
            
            if (isSuccess) {
                try {
                    // Check if container is running (1 = yes, 0 = no)
                    def runningStatus = sh(script: 'docker inspect -f "{{.State.Running}}" neuroforge-container || echo "false"', returnStdout: true).trim()
                    isRunning = (runningStatus == "true") ? 1 : 0
                    
                    // Grab live CPU and Memory stats from the container
                    if (isRunning == 1) {
                        def dockerStats = sh(script: 'docker stats neuroforge-container --no-stream --format "{{.CPUPerc}},{{.MemPerc}}" || echo "0.0%,0.0%"', returnStdout: true).trim()
                        // Remove the '%' signs and split
                        def cleanStats = dockerStats.replaceAll('%', '').split(',')
                        cpuUsage = cleanStats[0].toDouble()
                        memUsage = cleanStats[1].toDouble()
                    }
                } catch (Exception e) {
                    echo "Could not fetch Docker stats: ${e.message}"
                }
            }

            // 4. Build the payload with the dynamic variables
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
                
                testSummary: [
                    passed: testsPassed,
                    failed: testsFailed,
                    skipped: testsSkipped,
                    coveragePercent: coverageVal
                ],
                
                deploymentInfo: [
                    imageTag: "neuroforge-service",
                    podsRunning: isRunning,
                    podsTotal: 1, // Single docker container setup
                    cpuPercent: cpuUsage,
                    memoryPercent: memUsage
                ]
            ]

            def jsonPayload = groovy.json.JsonOutput.toJson(payloadMap)
            writeFile file: 'payload.json', text: jsonPayload
            
            echo "Sending Webhook Payload: ${jsonPayload}"
            sh "curl -s -X POST ${env.CONTROLLER_URL} -H 'Content-Type: application/json' -d @payload.json"
        }
    }
}
}