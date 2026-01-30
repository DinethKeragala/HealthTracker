terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "healthtracker" {
  name   = "healthtracker-server"
  region = "sgp1"
  size   = "s-1vcpu-512mb-10gb"
  image  = "ubuntu-22-04-x64"
}
