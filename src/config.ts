// Injected at build time from the happywheel-backend Terraform outputs.
// See .env.example and the GitHub Actions secrets in deploy.yml.
export const config = {
  apiUrl: import.meta.env.VITE_API_URL as string,
  region: import.meta.env.VITE_AWS_REGION as string,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
}
