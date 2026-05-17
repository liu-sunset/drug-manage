import { memo, useState } from "react"
import { LogOutIcon, PillIcon, UserXIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog"
import { useAuth } from "@/hooks/useAuth"

export const AppHeader = memo(function AppHeader() {
  const { profile, signOut } = useAuth()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/90 backdrop-blur-sm border-b-[3px] border-pencil/20">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 flex items-center justify-center bg-white border-[3px] border-pencil shadow-hard-sm"
            style={{ borderRadius: "185px 25px 155px 25px / 25px 175px 25px 165px" }}
          >
            <PillIcon className="w-5 h-5 text-marker" strokeWidth={2.5} />
          </div>
          <span className="font-heading text-xl text-pencil tracking-wide">药物管理</span>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="text-base text-pencil/70 hidden sm:block font-body">
              你好，<span className="text-pencil font-bold">{profile.username}</span>
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
            <LogOutIcon className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">退出</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-1.5 hover:text-marker hover:border-marker"
          >
            <UserXIcon className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">注销账户</span>
          </Button>
        </div>
      </div>
      <DeleteAccountDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </header>
  )
})
