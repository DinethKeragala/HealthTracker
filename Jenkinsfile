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
        withCredentials([
          string(credentialsId: 'do-token', variable: 'TF_VAR_do_token')
        ]) {
          dir('terraform') {
            sh '''
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
          ansible-playbook -i inventory.ini playbook.yml
          '''
        }
      }
    }
  }
}
