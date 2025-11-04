import React, { useState, useEffect } from "react";
import { XMarkIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { emailService } from "../services/emailService";
import type { EmailSender, EmailProvider, CreateEmailRequest, UpdateEmailRequest, SendTestEmailRequest } from "../types";

const AppSettings: React.FC = () => {
  const [emails, setEmails] = useState<EmailSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Email management dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailSender | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    emailProvider: "GMAIL" as EmailProvider,
  });

  // Test email dialog state
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailFormData, setTestEmailFormData] = useState({
    fromEmail: "",
    toEmail: "",
    subject: "",
    content: "",
  });
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await emailService.getAllEmails();
      setEmails(data.emails);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  const openAddEmailDialog = () => {
    setSelectedEmail(null);
    setIsEditMode(false);
    setEmailFormData({ email: "", emailProvider: "GMAIL" });
    setEmailDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const openEditEmailDialog = (email: EmailSender) => {
    setSelectedEmail(email);
    setIsEditMode(true);
    setEmailFormData({
      email: email.email,
      emailProvider: email.emailProvider,
    });
    setEmailDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeEmailDialog = () => {
    setEmailDialogOpen(false);
    setSelectedEmail(null);
    setIsEditMode(false);
    setEmailFormData({ email: "", emailProvider: "GMAIL" });
    setError(null);
    setSuccess(null);
  };

  const handleSaveEmail = async () => {
    try {
      setError(null);
      
      if (!emailFormData.email) {
        setError("Email is required");
        return;
      }

      if (isEditMode && selectedEmail) {
        const updateData: UpdateEmailRequest = {
          email: emailFormData.email,
          emailProvider: emailFormData.emailProvider,
        };
        await emailService.updateEmail(selectedEmail.id, updateData);
        setSuccess("Email sender updated successfully");
      } else {
        const createData: CreateEmailRequest = {
          email: emailFormData.email,
          emailProvider: emailFormData.emailProvider,
        };
        await emailService.createEmail(createData);
        setSuccess("Email sender created successfully");
      }

      await loadEmails();
      setTimeout(() => {
        closeEmailDialog();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save email sender");
    }
  };

  const handleDeleteEmail = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this email sender?")) {
      return;
    }

    try {
      await emailService.deleteEmail(id);
      setSuccess("Email sender deleted successfully");
      await loadEmails();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete email sender");
    }
  };

  const openTestEmailDialog = () => {
    if (emails.length === 0) {
      setError("Please add at least one email sender before sending a test email");
      return;
    }
    setTestEmailFormData({
      fromEmail: emails[0]?.email || "",
      toEmail: "",
      subject: "Test Email",
      content: "This is a test email from the application.",
    });
    setTestEmailDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const closeTestEmailDialog = () => {
    setTestEmailDialogOpen(false);
    setTestEmailFormData({
      fromEmail: emails[0]?.email || "",
      toEmail: "",
      subject: "Test Email",
      content: "This is a test email from the application.",
    });
    setError(null);
    setSuccess(null);
  };

  const handleSendTestEmail = async () => {
    try {
      setError(null);
      setSendingTestEmail(true);

      if (!testEmailFormData.fromEmail || !testEmailFormData.toEmail || !testEmailFormData.subject || !testEmailFormData.content) {
        setError("All fields are required");
        setSendingTestEmail(false);
        return;
      }

      const testEmailData: SendTestEmailRequest = {
        fromEmail: testEmailFormData.fromEmail,
        toEmail: testEmailFormData.toEmail,
        subject: testEmailFormData.subject,
        content: testEmailFormData.content,
      };

      await emailService.sendTestEmail(testEmailData);
      setSuccess("Test email sent successfully!");
      
      setTimeout(() => {
        closeTestEmailDialog();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send test email");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const getProviderBadgeColor = (provider: EmailProvider) => {
    return provider === "GMAIL" 
      ? "bg-red-100 text-red-800" 
      : "bg-blue-100 text-blue-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">{success}</div>}

      {/* Email Senders Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Email Senders</h2>
          <button
            type="button"
            onClick={openAddEmailDialog}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
          >
            Add Email Sender
          </button>
        </div>

        {emails.length === 0 ? (
          <div className="bg-white shadow-xs rounded-xl p-8 text-center">
            <p className="text-gray-500">No email senders configured. Add one to get started.</p>
          </div>
        ) : (
          <ul
            role="list"
            className="divide-y divide-gray-100 overflow-hidden bg-white shadow-xs outline-1 outline-gray-900/5 sm:rounded-xl"
          >
            {emails.map((email) => (
              <li key={email.id} className="relative py-5 hover:bg-gray-50">
                <div className="px-4 sm:px-6 lg:px-8">
                  <div className="mx-auto flex max-w-4xl justify-between gap-x-6">
                    <div className="flex min-w-0 gap-x-4 items-center">
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm/6 font-semibold text-gray-900">{email.email}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Added {new Date(email.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderBadgeColor(email.emailProvider)}`}
                      >
                        {email.emailProvider}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditEmailDialog(email)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(email.id)}
                          className="text-gray-400 hover:text-red-600 cursor-pointer"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Test Email Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Test Email</h2>
          <button
            type="button"
            onClick={openTestEmailDialog}
            disabled={emails.length === 0}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
          >
            Send Test Email
          </button>
        </div>
        <div className="bg-white shadow-xs rounded-xl p-6">
          <p className="text-sm text-gray-600">
            Send a test email to verify your email configuration is working correctly.
          </p>
        </div>
      </div>

      {/* Email Management Dialog */}
      <Dialog open={emailDialogOpen} onClose={closeEmailDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/25" />
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <form className="relative flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-semibold text-white">
                          {isEditMode ? "Edit Email Sender" : "Add Email Sender"}
                        </DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={closeEmailDialog}
                            className="relative rounded-md text-indigo-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {(error || success) && (
                      <div className="px-4 sm:px-6 pt-4">
                        {error && (
                          <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                            {success}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="divide-y divide-gray-200 px-4 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                              Email Address
                            </label>
                            <div className="mt-2">
                              <input
                                id="email"
                                name="email"
                                type="email"
                                value={emailFormData.email}
                                onChange={(e) => setEmailFormData({ ...emailFormData, email: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                                placeholder="sender@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="provider" className="block text-sm/6 font-medium text-gray-900">
                              Email Provider
                            </label>
                            <div className="mt-2">
                              <select
                                id="provider"
                                name="provider"
                                value={emailFormData.emailProvider}
                                onChange={(e) => setEmailFormData({ ...emailFormData, emailProvider: e.target.value as EmailProvider })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              >
                                <option value="GMAIL">Gmail</option>
                                <option value="OUTLOOK">Outlook</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 justify-end px-4 py-4">
                    <button
                      type="button"
                      onClick={closeEmailDialog}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEmail}
                      className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                    >
                      {isEditMode ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={closeTestEmailDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/25" />
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <form className="relative flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-semibold text-white">Send Test Email</DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={closeTestEmailDialog}
                            className="relative rounded-md text-indigo-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {(error || success) && (
                      <div className="px-4 sm:px-6 pt-4">
                        {error && (
                          <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                          </div>
                        )}
                        {success && (
                          <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                            {success}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="divide-y divide-gray-200 px-4 sm:px-6">
                        <div className="space-y-6 pt-6 pb-5">
                          <div>
                            <label htmlFor="fromEmail" className="block text-sm/6 font-medium text-gray-900">
                              From Email
                            </label>
                            <div className="mt-2">
                              <select
                                id="fromEmail"
                                name="fromEmail"
                                value={testEmailFormData.fromEmail}
                                onChange={(e) => setTestEmailFormData({ ...testEmailFormData, fromEmail: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              >
                                {emails.map((email) => (
                                  <option key={email.id} value={email.email}>
                                    {email.email} ({email.emailProvider})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="toEmail" className="block text-sm/6 font-medium text-gray-900">
                              To Email
                            </label>
                            <div className="mt-2">
                              <input
                                id="toEmail"
                                name="toEmail"
                                type="email"
                                value={testEmailFormData.toEmail}
                                onChange={(e) => setTestEmailFormData({ ...testEmailFormData, toEmail: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                                placeholder="recipient@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="subject" className="block text-sm/6 font-medium text-gray-900">
                              Subject
                            </label>
                            <div className="mt-2">
                              <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={testEmailFormData.subject}
                                onChange={(e) => setTestEmailFormData({ ...testEmailFormData, subject: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                                placeholder="Email subject"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="content" className="block text-sm/6 font-medium text-gray-900">
                              Message Content
                            </label>
                            <div className="mt-2">
                              <textarea
                                id="content"
                                name="content"
                                rows={6}
                                value={testEmailFormData.content}
                                onChange={(e) => setTestEmailFormData({ ...testEmailFormData, content: e.target.value })}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                                placeholder="Email message content"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 justify-end px-4 py-4">
                    <button
                      type="button"
                      onClick={closeTestEmailDialog}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendTestEmail}
                      disabled={sendingTestEmail}
                      className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {sendingTestEmail ? "Sending..." : "Send Email"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AppSettings;
