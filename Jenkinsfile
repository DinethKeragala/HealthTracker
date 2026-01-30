pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'dinethkeragala'
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
                  docker build -t dinethkeragala/healthtracker-server:latest -f server/Dockerfile server
                  docker build -t dinethkeragala/healthtracker-client:latest -f client/Dockerfile client
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                      docker push dinethkeragala/healthtracker-server:latest
                      docker push dinethkeragala/healthtracker-client:latest
                    '''
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                withCredentials([
                    string(credentialsId: 'do-token', variable: 'TF_VAR_do_token')
                ]) {
                    dir('terraform') {
                        sh '''
                          rm -rf .terraform
                          terraform init -input=false
                          terraform apply -auto-approve -input=false
                        '''
                    }
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
                sshagent(credentials: ['healthtracker-ssh']) {
                    dir('ansible') {
                        sh '''
                          ansible-playbook -i inventory.ini playbook.yml
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
