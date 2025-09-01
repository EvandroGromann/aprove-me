output "ecr_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "ECR repository URL"
}

output "apprunner_service_arn" {
  value       = aws_apprunner_service.api.arn
  description = "App Runner service ARN"
}

output "apprunner_service_url" {
  value       = aws_apprunner_service.api.service_url
  description = "Public URL of the App Runner service"
}

output "github_oidc_role_arn" {
  value       = aws_iam_role.github_actions.arn
  description = "IAM role ARN to configure in GitHub (AWS_ROLE_TO_ASSUME)"
}
