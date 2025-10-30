import { FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaccar } from "@/context/TaccarContext";

type TaccarConnectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DEFAULT_BASE_URL = "http://localhost:8082";
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";

const TaccarConnectDialog = ({ open, onOpenChange }: TaccarConnectDialogProps) => {
  const { config, setConfig, clearConfig } = useTaccar();
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValidationError(null);
    if (config) {
      setBaseUrl(config.baseUrl);
      setUsername(config.username);
      setPassword(config.password);
    } else {
      setBaseUrl(DEFAULT_BASE_URL);
      setUsername(DEFAULT_USERNAME);
      setPassword(DEFAULT_PASSWORD);
    }
  }, [open, config]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedBaseUrl = baseUrl.trim();
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setValidationError("Username is required.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedBaseUrl);
    } catch {
      setValidationError("Enter a full URL including http:// or https://.");
      return;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      setValidationError("The Traccar server URL must start with http:// or https://.");
      return;
    }

    if (typeof window !== "undefined" && window.location.protocol === "https:" && parsedUrl.protocol === "http:") {
      setValidationError(
        "This app is running over HTTPS. Browsers block requests to an HTTP Traccar server. Serve Traccar over HTTPS or access this app over HTTP."
      );
      return;
    }

    const normalizedBaseUrl = parsedUrl.toString().replace(/\/+$/, "");

    setConfig({
      baseUrl: normalizedBaseUrl,
      username: trimmedUsername,
      password,
    });
    onOpenChange(false);
  };

  const handleClear = () => {
    clearConfig();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect to Traccar</DialogTitle>
          <DialogDescription>
            Provide the URL and credentials for your Traccar server to load live GPS positions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="traccar-url">Server URL</Label>
            <Input
              id="traccar-url"
              placeholder={DEFAULT_BASE_URL}
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              required
              type="url"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traccar-username">Username</Label>
            <Input
              id="traccar-username"
              placeholder={DEFAULT_USERNAME}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traccar-password">Password</Label>
            <Input
              id="traccar-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {validationError ? (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter className="flex items-center justify-between gap-2">
            <Button type="button" variant="ghost" onClick={handleClear}>
              Use defaults
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save connection</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaccarConnectDialog;
