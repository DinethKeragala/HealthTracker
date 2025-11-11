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
                sh """
                    docker build --no-cache \
                      -t ${CLIENT_IMAGE}:${IMAGE_TAG} \
                      ./client
                """
            }
        }

        stage('Build server image') {
            steps {
                sh """
                    docker build \
                      -t ${SERVER_IMAGE}:${IMAGE_TAG} \
                      ./server
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push images') {
            steps {
                sh """
                    docker push ${CLIENT_IMAGE}:${IMAGE_TAG}
                    docker push ${SERVER_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Run docker-compose') {
            steps {
                sh """
                    # Clean up any old containers with same names (safety)
                    docker rm -f healthtracker-frontend healthtracker-backend healthtracker-mongo || true

                    # Restart the stack from docker-compose.yml
                    docker compose down || true
                    docker compose up -d
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        success {
            echo "Pushed images and restarted docker-compose stack."
        }
    }
}
