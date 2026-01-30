# How to Fix "400 Bad Request" and Get Real Users

The system is failing to load users because your Authentication Token has expired or is invalid for your friend's backend.

Since I cannot generate the token (my access to your terminal output is limited), you must do it manually:

1.  Open your terminal (VS Code or Cmd).
2.  Navigate to `d:\lms-management-system\new learning clone git\LMS-Project-Demo`.
3.  Run this command:
    ```bash
    node generate_token.js
    ```
    (Note: ensure you are using `generate_token.js` which I updated, NOT `.cjs`).

4.  It will verify that it wrote to `src/generated_token.json`.

5.  **Refresh Your Browser**.

6.  The app will automatically log you in with the new token, and you should see the **Real Users** in the Reservation Modal.
