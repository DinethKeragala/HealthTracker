variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
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
