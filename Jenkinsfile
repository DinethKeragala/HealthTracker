pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "dinethkeragala"
        BACKEND_IMAGE  = "healthtracker-server"
        FRONTEND_IMAGE = "healthtracker-client"
        TF_IN_AUTOMATION = "true"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${DOCKERHUB_USER}/${BACKEND_IMAGE}:latest", "backend")
                    docker.build("${DOCKERHUB_USER}/${FRONTEND_IMAGE}:latest", "frontend")
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker push ${DOCKERHUB_USER}/${BACKEND_IMAGE}:latest
                        docker push ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    withCredentials([string(
                        credentialsId: 'do-token',
                        variable: 'DIGITALOCEAN_TOKEN'
                    )]) {
                        sh """
                            terraform init
                            terraform apply -auto-approve
                        """
                    }
                }
            }
        }

        stage('Ansible Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'droplet-ssh',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh """
                        export ANSIBLE_HOST_KEY_CHECKING=False
                        ansible-playbook -i ansible/inventory.ini ansible/playbook.yml \
                          --private-key \$SSH_KEY
                    """
                }
            }
        }
    }
}
