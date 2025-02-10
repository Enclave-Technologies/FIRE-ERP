import { Button } from "@/components/ui/button";
import { login, signup } from "../../../supabase/auth/actions";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-6">Login</h1>
            <form className=" p-8 rounded shadow-md w-80">
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium"
                    >
                        Email:
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                    >
                        Password:
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <Button
                    type="submit"
                    formAction={login}
                    className="w-full  p-2 rounded "
                >
                    Log in
                </Button>
                <Button
                    type="submit"
                    formAction={signup}
                    className="w-full mt-2 p-2 rounded "
                    variant={"secondary"}
                >
                    Sign up
                </Button>
            </form>
        </div>
    );
}
