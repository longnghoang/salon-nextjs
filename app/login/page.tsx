import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-border">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to manage the salon
        </p>
      </div>

      <div className="w-full max-w-sm">
        <form
          action={async () => {
            "use server"
            await signIn("azure-ad-b2c")
          }}
        >
          <Button type="submit" className="w-full">
            Sign In with Azure AD B2C
          </Button>
        </form>
      </div>
    </div>
  )
}
