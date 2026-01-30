terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {}


resource "digitalocean_ssh_key" "default" {
  name       = "healthtracker-key"
  public_key = file(var.ssh_public_key_path)
}

resource "digitalocean_droplet" "healthtracker" {
  name   = var.droplet_name
  region = var.region
  size   = var.droplet_size
  image  = "ubuntu-22-04-x64"

  ssh_keys = [
    digitalocean_ssh_key.default.id
  ]

  tags = ["healthtracker"]
}
