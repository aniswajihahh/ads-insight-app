import LoginForm from "@/app/login/LoginForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/";
  return <LoginForm next={next} defaultAuthMode="signup" />;
}
