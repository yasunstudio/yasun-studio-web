import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABEL } from "@/features/account/account-menu";
import { PasswordForm, ProfileForm } from "@/features/account/account-forms";
import { api } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Akun" };

export default async function AccountPage() {
  const me = await api<User>("/users/me", { auth: true });
  return (
    <div className="grid grid-cols-1 gap-6">
      <PageHeader title="Akun" description={`${ROLE_LABEL[me.role]} · bergabung sejak ${formatDate(me.created_at)}`} />
      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Nama ini tampil di dashboard dan sertifikatmu nanti.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm fullName={me.full_name} email={me.email} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>Gunakan kata sandi yang kuat dan unik.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
