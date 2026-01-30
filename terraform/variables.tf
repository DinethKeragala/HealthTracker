variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "region" {
  default = "sgp1"
}

variable "droplet_size" {
  default = "s-1vcpu-512mb-10gb"
}

variable "droplet_name" {
  default = "healthtracker-server"
}
