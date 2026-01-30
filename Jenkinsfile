pipeline {
    agent any

    environment {
        DOCKER_USER = 'dinethkeragala'
        TF_VAR_do_token = credentials('do-token')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                  docker build -t $DOCKER_USER/healthtracker-server:latest -f server/Dockerfile server
                  docker build -t $DOCKER_USER/healthtracker-client:latest -f client/Dockerfile client
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                      docker push $DOCKER_USER/healthtracker-server:latest
                      docker push $DOCKER_USER/healthtracker-client:latest
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    sh '''
                      rm -rf .terraform
                      terraform init -input=false
                      terraform apply -auto-approve -input=false
                    '''
                }
            }
        }

        stage('Generate Ansible Inventory') {
            steps {
                dir('terraform') {
                    sh '''
                      IP=$(terraform output -raw droplet_ip)
                      echo "[healthtracker]" > ../ansible/inventory.ini
                      echo "server ansible_host=$IP ansible_user=root" >> ../ansible/inventory.ini
                    '''
                }
            }
        }

        stage('Ansible Deploy') {
            steps {
                sshagent(['healthtracker-ssh']) {
                    sh '''
                      ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
