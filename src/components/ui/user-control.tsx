import { UserButton } from "@clerk/nextjs";

export const UserControl = ({ showName }: { showName: boolean }) => {
    
    return (
      <UserButton
        showName={showName}
        appearance={{
          elements: {
            userButtonBox: "rounded-md!",
            userButtonAvatarBox: "rounded-md! size-8!",
            userButtonTrigger: "rounded-md!"
          },
        }}
      />
    );
  };
  