pipeline {
  agent any

  environment {
    DOCKER_USER = 'dinethkeragala'
  }

  stages {
    stage('Build Images') {
      steps {
        sh '''
        docker build -t $DOCKER_USER/healthtracker-server:latest -f server/Dockerfile server
        docker build -t $DOCKER_USER/healthtracker-client:latest -f client/Dockerfile client
        '''
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
          echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
          docker push $DOCKER_USER/healthtracker-server:latest
          docker push $DOCKER_USER/healthtracker-client:latest
          '''
        }
      }
    }

    stage('Terraform Apply') {
      steps {
        withCredentials([string(credentialsId: 'do-token', variable: 'TF_VAR_do_token')]) {
          dir('terraform') {
            sh '''
            set -eu

            # Work around Jenkins workspaces mounted with "noexec" (Terraform providers are native binaries).
            # By moving Terraform's data dir to /tmp, provider binaries become executable.
            export TF_DATA_DIR="$(mktemp -d)"
            export TF_PLUGIN_CACHE_DIR="${HOME}/.terraform.d/plugin-cache"
            mkdir -p "$TF_PLUGIN_CACHE_DIR"

            terraform init -input=false
            terraform apply -auto-approve -input=false
            '''
          }
        }
      }
    }

    stage('Ansible Deploy') {
      steps {
        sshagent(credentials: ['deploy-ssh']) {
          sh '''
          ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
          '''
        }
      }
    }
  }
}
