output "server_ip" {
  value = digitalocean_droplet.healthtracker.ipv4_address
}
