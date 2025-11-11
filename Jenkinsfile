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
                    docker build \
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
                // Make sure we are in the workspace root where docker-compose.yml lives
                sh """
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
            echo "Pushed to Docker Hub and started docker-compose stack."
        }
    }
}