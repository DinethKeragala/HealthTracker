pipeline {
    agent any

    options {
        // Declarative pipelines do an implicit checkout by default.
        // We do an explicit checkout in the first stage, so skip the default.
        skipDefaultCheckout(true)
    }

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
                sh """
                                    docker build -t ${DOCKERHUB_USER}/${BACKEND_IMAGE}:latest -f server/Dockerfile server
                                    docker build -t ${DOCKERHUB_USER}/${FRONTEND_IMAGE}:latest -f client/Dockerfile client \
                                        --build-arg VITE_API_URL=/api
                """
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
                          # Some Jenkins setups mount the workspace with `noexec`, which breaks Terraform providers.
                          # Put Terraform's data dir (including provider binaries) under /tmp where execution is allowed.
                          export TF_DATA_DIR=\"/tmp/terraform-${JOB_NAME}-${BUILD_NUMBER}\"
                          mkdir -p \"\$TF_DATA_DIR\"

                          export TF_PLUGIN_CACHE_DIR=\"/tmp/terraform-plugin-cache\"
                          mkdir -p \"\$TF_PLUGIN_CACHE_DIR\"

                          export TF_VAR_do_token=\"\$DIGITALOCEAN_TOKEN\"
                          terraform init
                          terraform apply -auto-approve
                        """
                    }
                }
            }
        }

        stage('Ansible Deploy') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'droplet-ssh',
                    usernameVariable: 'SSH_USER',
                    passwordVariable: 'SSH_PASS'
                )]) {
                    sh """
                      export ANSIBLE_HOST_KEY_CHECKING=False
                      ansible-playbook -i ansible/inventory.ini ansible/playbook.yml \
                        -u \$SSH_USER --extra-vars "ansible_ssh_pass=\$SSH_PASS"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully. Application deployed."
        }
        failure {
            echo "❌ Pipeline failed. Check logs above."
        }
    }
}
