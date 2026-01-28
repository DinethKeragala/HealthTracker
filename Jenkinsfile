pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME     = 'dinethkeragala'
        DOCKERHUB_CREDENTIALS  = 'dockerhub-creds'

        CLIENT_IMAGE = "${DOCKERHUB_USERNAME}/healthtracker-client"
        SERVER_IMAGE = "${DOCKERHUB_USERNAME}/healthtracker-server"

        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build client image') {
            steps {
                script {
                    def cmd = """
                        docker build --no-cache \
                          --build-arg VITE_API_URL=/api \
                          -t ${CLIENT_IMAGE}:${IMAGE_TAG} \
                          ./client
                    """.stripIndent().trim()

                    if (isUnix()) {
                        sh cmd
                    } else {
                        bat cmd
                    }
                }
            }
        }

        stage('Build server image') {
            steps {
                script {
                    def cmd = """
                        docker build \
                          -t ${SERVER_IMAGE}:${IMAGE_TAG} \
                          ./server
                    """.stripIndent().trim()

                    if (isUnix()) {
                        sh cmd
                    } else {
                        bat cmd
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        def cmd = isUnix()
                            ? 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                            : 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'

                        if (isUnix()) {
                            sh cmd
                        } else {
                            bat cmd
                        }
                    }
                }
            }
        }

        stage('Push images') {
            steps {
                script {
                    def cmd = """
                        docker push ${CLIENT_IMAGE}:${IMAGE_TAG}
                        docker push ${SERVER_IMAGE}:${IMAGE_TAG}
                    """.stripIndent().trim()

                    if (isUnix()) {
                        sh cmd
                    } else {
                        bat cmd
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (isUnix()) {
                    sh 'docker logout || true'
                } else {
                    bat 'docker logout'
                }
            }
        }
        success {
            echo "Pushed images to Docker Hub: ${CLIENT_IMAGE}:${IMAGE_TAG}, ${SERVER_IMAGE}:${IMAGE_TAG}"
        }
    }
}
