<script lang="ts">
    import { ChangePassword } from "$lib/adapter/auth";
    import { SnackBar } from "$lib/components/snackbar.store";
    import { getCookie } from "$lib/cookies";

  let password: string;
  let newpassword: string;
  let newpassword_confirm: string;

  async function editpassword() {
    try {
      if (newpassword !== newpassword_confirm) {
        throw new Error("Passwords do not match");
      } else if (newpassword === password) {
        throw new Error("New Password matches the old");
      } else if (newpassword.length < 8) {
        throw new Error("New Password needs to contain more than 7 Characters");
      } else {
        await ChangePassword(getCookie("auth"), password, newpassword);

        $SnackBar.message = "Successfully changed Password";
        $SnackBar.color = "green"
      }
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red"
    }
    resetForm();
  }

  function resetForm() {
    newpassword = "";
    password = "";
    newpassword_confirm = "";
  }
</script>

<div class="main-container">
  <h1>Change Password</h1>

  <input bind:value={password} type="password" placeholder="Old Password">
  <input bind:value={newpassword} type="password" placeholder="New Password" minlength="8">
  <input bind:value={newpassword_confirm} on:submit={editpassword} type="password" placeholder="Confirm New Password" minlength="8">
  
  <div style="display: flex; flex-direction: row;">
    <button on:click={() => window.location.href = '/profile'}>Cancel</button>
    <button on:click={editpassword}>Change</button>
  </div>
</div>

<style>
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>