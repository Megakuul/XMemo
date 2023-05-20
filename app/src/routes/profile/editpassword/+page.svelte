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

<div class="main-form">
  <h1 style="font-size: 50px;">Change Password</h1>

  <input bind:value={password} type="password" placeholder="Old Password">

  <input bind:value={newpassword} type="password" placeholder="New Password" minlength="8">
  
  <input bind:value={newpassword_confirm} on:submit={editpassword} type="password" placeholder="Confirm New Password" minlength="8">
  
  <div style="display: flex; flex-direction: row; justify-content: center;">
    <button on:click={() => window.location.href = '/profile'}>Cancel</button>
    <button on:click={editpassword}>Change</button>
  </div>
</div>

<style>
  .main-form {
    display: flex;
    align-self: center;
    justify-self: center;
    flex-direction: column;

    margin: 100px 20px 20px 20px;
    padding: 20px;
    max-height: 700px;
    min-height: 500px;
    background-color: rgb(255, 255, 255, 0.04);
    border-radius: 25px;
    user-select: none;
    overflow: hidden;
  }

  .main-form input{
    display: block;
    border: none;
    font: 'Raleway', sans-serif;
    font-size: 2rem;

    background-color: rgba(255,255,255,0.07);
    color: white;

    height: 50px;
    padding: 10px;
    margin: 15px;
    border-radius: 8px;

    transition: all ease .5s;
  }
  .main-form input:focus {
    outline: none;
    box-shadow: 0.2rem 0.8rem 1.6rem rgb(0, 0, 0, 0.5);
  }
  .main-form button {
    height: 50px;
    font-size: 1.8rem;
    padding: 10px;
    margin: 15px;
    width: 40%;
    border-radius: 8px;
    border: none;

    color: white;
    background-color: rgb(0, 0, 0, 0.3);
    cursor: pointer;
    overflow: hidden;
    
    transition: all ease .5s;
  }
  .main-form button:hover {
    background-color: rgb(0, 0, 0, 0.2);
    color:rgb(255, 255, 255, 0.6);
  }

  @media screen and (max-width: 700px) {
    .main-form {
      width: 80%;
    }

    .main-form input {
      font-size: 1.2rem;
      height: 30px;
    }

    .main-form button {
      font-size: 1rem;
      height: 30px;
    }
  }
</style>