variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "aprove-me"
}

variable "ecr_repository_name" {
  description = "ECR repository name for the API image"
  type        = string
  default     = "aprove-me-api"
}

variable "apprunner_service_name" {
  description = "App Runner service name"
  type        = string
  default     = "aprove-me-api"
}

variable "github_org" {
  description = "GitHub organization/owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "github_environment" {
  description = "GitHub environment or branch restriction for OIDC (optional)"
  type        = string
  default     = "*"
}
