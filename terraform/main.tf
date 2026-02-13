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

# USE EXISTING SSH KEY IN DIGITALOCEAN (Jenkins-safe)
data "digitalocean_ssh_key" "default" {
  name = "healthtracker-key"
}

resource "digitalocean_droplet" "healthtracker" {
  name   = var.droplet_name
  region = var.region
  size   = var.droplet_size
  image  = "ubuntu-22-04-x64"

  ssh_keys = [
    data.digitalocean_ssh_key.default.id
  ]

  tags = ["healthtracker"]
}
