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
            // 1. Fix the Enum Mismatch
            def jenkinsStatus = currentBuild.currentResult ?: 'SUCCESS'
            def mappedStatus = (jenkinsStatus == 'FAILURE') ? 'FAILED' : jenkinsStatus
            def isSuccess = (mappedStatus == 'SUCCESS')
            def durationSecs = currentBuild.duration ? (currentBuild.duration / 1000).toInteger() : 0

            // 2. Fix the Test Parsing Logic
            def testsPassed = 0
            def testsFailed = 0
            def testsSkipped = 0
            
            try {
                // Safer parsing that explicitly looks for attribute names regardless of order
                def testStats = sh(script: '''
                    grep "<testsuite" Backend/target/surefire-reports/TEST-*.xml | awk '{
                        tests=0; failures=0; errors=0; skipped=0;
                        for(i=1;i<=NF;i++) {
                            if($i ~ /^tests=/) { split($i,a,"\\""); tests=a[2] }
                            if($i ~ /^failures=/) { split($i,a,"\\""); failures=a[2] }
                            if($i ~ /^errors=/) { split($i,a,"\\""); errors=a[2] }
                            if($i ~ /^skipped=/) { split($i,a,"\\""); skipped=a[2] }
                        }
                        print tests","failures+errors","skipped
                    }' || echo "0,0,0"
                ''', returnStdout: true).trim().split(',')
                
                def totalTests = testStats[0].toInteger()
                testsFailed = testStats[1].toInteger()
                testsSkipped = testStats[2].toInteger()
                testsPassed = totalTests - testsFailed - testsSkipped
            } catch (Exception e) {
                echo "Could not parse test results: ${e.message}"
            }

            // 3. Fix the Security Sandbox Exception
            def coverageVal = 0.0
            try {
                def covString = sh(script: '''
                    awk -F"," '{ instructions += $4 + $5; covered += $5 } END { if (instructions > 0) print (covered/instructions)*100; else print 0 }' Backend/target/site/jacoco/jacoco.csv || echo "0.0"
                ''', returnStdout: true).trim()
                // Removed .round(2) to comply with Jenkins Sandbox security
                coverageVal = covString.toDouble()
            } catch (Exception e) {
                echo "Could not parse coverage: ${e.message}"
            }

            def cpuUsage = 0.0
            def memUsage = 0.0
            def isRunning = 0
            
            if (isSuccess) {
                try {
                    def runningStatus = sh(script: 'docker inspect -f "{{.State.Running}}" neuroforge-container || echo "false"', returnStdout: true).trim()
                    isRunning = (runningStatus == "true") ? 1 : 0
                    
                    if (isRunning == 1) {
                        def dockerStats = sh(script: 'docker stats neuroforge-container --no-stream --format "{{.CPUPerc}},{{.MemPerc}}" || echo "0.0%,0.0%"', returnStdout: true).trim()
                        def cleanStats = dockerStats.replaceAll('%', '').split(',')
                        cpuUsage = cleanStats[0].toDouble()
                        memUsage = cleanStats[1].toDouble()
                    }
                } catch (Exception e) {
                    echo "Could not fetch Docker stats: ${e.message}"
                }
            }

            def payloadMap = [
                projectId: env.PROJECT_ID.toInteger(),
                status: mappedStatus,
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
                    podsTotal: 1, 
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