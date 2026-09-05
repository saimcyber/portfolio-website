# saimzaib.tech — All Website Text

All 136 pieces of editable text on the site, in the order a visitor meets
them. Edit the text, send this file back, and I'll apply it to the code.

Two things are deliberately left out: the live values in the Digital Footprint
section, which are read from the visitor's own browser, and the column headers
and status words inside the shell's fake `kubectl` tables, which copy real
Kubernetes output. Section 15 lists everything that isn't a text edit.

---

## How to edit this file

**Only change the text inside the grey boxes.** Everything else — the `id:`
lines, the headings, the "Where" and "Notes" lines — is how I find each string
and put it back in the right place.

```
id: example.something      <- do NOT change this line
Where: ...                 <- do NOT change this line
```
```
Hello! I'm                 <- change THIS, the box underneath
```

- **Leave a box empty** to delete that text from the site. I'll tell you if
  removing it would break the layout.
- **Don't rename the ids.** If an id goes missing I can't match it up.
- **A note on Word:** Word silently "corrects" straight quotes into curly ones
  and `--` into a dash, and it may eat the grey boxes entirely. If you can,
  edit this in Notepad, VS Code, or the GitHub web editor instead. If you do
  use Word, that's fine — send it back anyway and I'll clean up the
  substitutions before applying. Just don't be surprised if quotes look
  different.
- **Character limits matter in a few places.** Where they do, the Notes line
  says so. Ignore them and text will overflow or wrap badly.

---

# 1. Browser tab & link previews

Not visible on the page itself. This is the tab title, the Google search
result, and the card that appears when you paste your link into LinkedIn,
WhatsApp or Twitter.

### Page title

```
id: meta.title
Where: Browser tab, and the blue headline in Google results
Notes: Keep under ~60 characters or Google truncates it
```
```
Saim Zaib - DevOps & Cloud Engineer
```

### Search description

```
id: meta.description
Where: The grey summary under your link in Google results
Notes: Keep under ~155 characters or Google truncates it
```
```
Saim Zaib - DevOps and Cloud Engineer based in Islamabad, Pakistan. Kubernetes, Terraform, Docker and CI/CD automation, with a security-first approach to infrastructure.
```

### Author name

```
id: meta.author
Where: Page metadata, not visible
```
```
Saim Zaib
```

### Social share title

```
id: meta.share.title
Where: Bold headline on the preview card when your link is shared
```
```
Saim Zaib - DevOps & Cloud Engineer
```

### Social share description

```
id: meta.share.description
Where: Smaller text under the headline on the share card
```
```
DevOps and Cloud Engineer building secure, scalable infrastructure with Kubernetes, Terraform, Docker and CI/CD automation.
```

### Share image alt text

```
id: meta.share.imageAlt
Where: Read aloud by screen readers describing the share image
```
```
Saim Zaib - DevOps & Cloud Engineer, Islamabad
```

---

# 2. Loading screen

The first thing anyone sees. A fake deploy pipeline runs while the 3D scene
loads.

### Status word

```
id: loading.status.busy
Where: Top right of the loading screen, while still loading
Notes: One word. Longer text will crowd your name on the left.
```
```
provisioning
```

```
id: loading.status.ready
Where: Same spot, once loading hits 100%
Notes: One word
```
```
ready
```

### Scrolling banner

Two phrases that scroll across the loading screen on a loop.

```
id: loading.marquee.1
Where: Scrolling text near the top of the loading screen
```
```
Automate Everything
```

```
id: loading.marquee.2
Where: Alternates with the phrase above
```
```
Secure By Default
```

### Loading button

```
id: loading.label
Where: Inside the loading button, before the percentage ("Loading 47%")
Notes: The % number is added automatically
```
```
Loading
```

```
id: loading.welcome
Where: Replaces "Loading" once it reaches 100%
Notes: Short — it sits inside a fixed-width button
```
```
Welcome
```

### Boot terminal

A fake terminal window that types out deploy commands as the page loads.

```
id: loading.terminal.title
Where: Title bar of the small black terminal panel
```
```
saim@portfolio — deploy
```

The lines below appear one at a time as loading progresses. Lines starting
with `$` are styled as commands, lines starting with `✓` are styled green as
successes. Keep those markers if you want to keep the styling.

```
id: loading.boot.1
Where: Boot terminal, first line (appears at 3%)
```
```
$ docker pull registry/base:alpine
```

```
id: loading.boot.2
Where: Boot terminal (14%)
```
```
✓ layers verified
```

```
id: loading.boot.3
Where: Boot terminal (26%)
```
```
$ terraform init && terraform plan
```

```
id: loading.boot.4
Where: Boot terminal (38%)
```
```
✓ 12 to add, 0 to change, 0 to destroy
```

```
id: loading.boot.5
Where: Boot terminal (50%)
```
```
$ trivy image --severity HIGH,CRITICAL
```

```
id: loading.boot.6
Where: Boot terminal (63%)
```
```
✓ 0 vulnerabilities found
```

```
id: loading.boot.7
Where: Boot terminal (75%)
```
```
$ kubectl apply -f k8s/
```

```
id: loading.boot.8
Where: Boot terminal (88%)
```
```
✓ deployment.apps/portfolio configured
```

```
id: loading.boot.9
Where: Boot terminal (97%)
```
```
✓ rollout complete
```

```
id: loading.boot.10
Where: Boot terminal, last line (100%)
Notes: This is how visitors discover the hidden shell. Worth keeping.
```
```
tip: press ~ anywhere for a shell
```

---

# 3. Navigation bar

Fixed across the top of every section.

```
id: nav.link.1
Where: Top nav, first link — jumps to the About section
Notes: Max ~8 characters. Longer text crowds the other links on laptops.
```
```
ABOUT
```

```
id: nav.link.2
Where: Top nav, second link — jumps to Career
Notes: Max ~8 characters
```
```
CAREER
```

```
id: nav.link.3
Where: Top nav, third link — jumps to Work
Notes: Max ~8 characters
```
```
WORK
```

```
id: nav.link.4
Where: Top nav, fourth link — jumps to Contact
Notes: Max ~8 characters
```
```
CONTACT
```

The name on the top left and the email in the middle of the nav both come from
**Section 12 (Your details)** — change them there and they update everywhere.

---

# 4. Hero (the first screen)

Your name on the left, the rotating headline on the right, the 3D cluster in
the middle.

```
id: hero.greeting
Where: Small purple line directly above your name
```
```
Hello! I'm
```

```
id: hero.firstName
Where: Huge type, first line of your name
Notes: All-caps is the design. Long names will wrap awkwardly.
```
```
SAIM
```

```
id: hero.lastName
Where: Huge type, second line of your name
```
```
ZAIB
```

### Rotating headline

Reads as **"I automate at scale"**, then swaps the verb to **"I secure at
scale"** on a loop. Three parts:

```
id: hero.pronoun
Where: Small purple word above the rotating headline
Notes: Very short — it sits on its own line
```
```
I
```

```
id: hero.verb.1
Where: Large purple verb, first half of the loop
Notes: Max ~9 characters. This is the widest text on mobile — longer words
       run off the screen edge on a 360px phone.
```
```
Automate
```

```
id: hero.verb.2
Where: Same spot, swaps in on the second half of the loop
Notes: Max ~9 characters. Must be a similar length to the verb above or the
       swap animation looks lopsided.
```
```
Secure
```

```
id: hero.suffix
Where: The line under the verb — the part that does NOT change
Notes: Max ~12 characters
```
```
At Scale
```

### Scroll prompt

```
id: hero.scrollCue
Where: Small label with a line under it, centred near the bottom of the hero.
       Fades out once you start scrolling.
Notes: One short word
```
```
Scroll
```

```
id: hero.shellHint
Where: The small pill button at the very bottom centre that opens the hidden
       terminal. Shows as "~ shell".
Notes: The ~ symbol is separate and always shown. This is just the word.
```
```
shell
```

---

# 5. About

```
id: about.heading
Where: Small purple heading above the paragraph
```
```
About Me
```

```
id: about.body
Where: The large paragraph — the main statement about you
Notes: KEEP THIS SHORT. On phones this type is large and fixed size, so
       anything much longer than what's here runs off the bottom of the
       screen. Roughly 200 characters is the safe ceiling.
```
```
I build and secure the infrastructure that ships software — Kubernetes, Terraform, and CI/CD pipelines that scan before they deploy. Cyber Security undergrad and AWS community lead in Islamabad.
```

---

# 6. What I Do

Two cards side by side.

```
id: whatido.heading
Where: Large heading above the two cards. Renders as "WHAT / I DO" on two
       lines with the first letter of each emphasised.
```
```
WHAT I DO
```

```
id: whatido.label.description
Where: Small label above the paragraph on BOTH cards
```
```
Description
```

```
id: whatido.label.tags
Where: Small label above the tag pills on BOTH cards
```
```
Skillset & tools
```

### Card 1

```
id: whatido.card1.title
Where: Big heading on the left card
Notes: One word works best. This mirrors hero.verb.1 above — consider
       changing both together.
```
```
AUTOMATE
```

```
id: whatido.card1.description
Where: Paragraph on the left card
Notes: Around 150 characters fits comfortably
```
```
I build the pipelines that take code from commit to production without anyone touching a server, and the infrastructure they run on.
```

```
id: whatido.card1.tags
Where: The row of small pills at the bottom of the left card
Notes: Separate each tag with a comma. Add or remove as many as you like.
```
```
Docker, Kubernetes, Terraform, AWS, GitHub Actions, Jenkins, Helm, Ansible, GitOps, Python
```

### Card 2

```
id: whatido.card2.title
Where: Big heading on the right card
Notes: Mirrors hero.verb.2
```
```
SECURE
```

```
id: whatido.card2.description
Where: Paragraph on the right card
```
```
Security belongs inside the pipeline, not bolted on after it. I scan images before they ship and keep clusters observable.
```

```
id: whatido.card2.tags
Where: The row of small pills at the bottom of the right card
Notes: Comma-separated
```
```
Trivy, Prometheus, Grafana, RBAC, SAST/DAST, Linux, Nginx, Vulnerability Assessment
```

---

# 7. Career

A vertical timeline. Currently three entries — tell me if you want more or
fewer and I'll add or remove blocks.

```
id: career.heading
Where: Large heading above the timeline. Renders across two lines with the
       "&" in purple.
```
```
My career & experience
```

### Entry 1

```
id: career.1.role
Where: Bold job/degree title
```
```
BS Cyber Security
```

```
id: career.1.organization
Where: Purple line under the title — where it happened
```
```
FAST NUCES, Islamabad
```

```
id: career.1.period
Where: Large number on the right of the row
Notes: Short — a year, or a word like "NOW". Long text collides with the
       role title on phones.
```
```
2024
```

```
id: career.1.description
Where: Paragraph under the row
```
```
Undergraduate degree in Cyber Security, building the foundation behind a DevSecOps approach to infrastructure: secure network design, least-privilege access, vulnerability assessment and incident response applied to cloud and container platforms.
```

### Entry 2

```
id: career.2.role
Where: Bold job title
```
```
DevSecOps Officer
```

```
id: career.2.organization
Where: Purple line under the title
```
```
Google Developer Groups on Campus, FAST Islamabad
```

```
id: career.2.period
Where: Large number on the right
```
```
2025
```

```
id: career.2.description
Where: Paragraph under the row
```
```
Implemented CI/CD workflows and containerized applications using Docker and GitHub Actions for internal projects and community events, standardizing the build-and-deploy process across teams. Automated recurring deployment and environment-setup tasks with Infrastructure as Code, replacing manual steps with repeatable pipelines.
```

### Entry 3

```
id: career.3.role
Where: Bold job title
```
```
AWS Community Leader
```

```
id: career.3.organization
Where: Purple line under the title
```
```
AWS Student Builder Community, FAST Islamabad
```

```
id: career.3.period
Where: Large text on the right
```
```
NOW
```

```
id: career.3.description
Where: Paragraph under the row
```
```
Design and lead hands-on workshops on AWS core services, CI/CD pipelines and Infrastructure as Code, training students to deploy cloud-based projects end-to-end. Mentor peers on Docker, Kubernetes and CI/CD automation, guiding them from tutorials to deploying real containerized projects.
```

---

# 8. Work / Projects

Cards that scroll sideways as you scroll down. Currently three — tell me if
you want more or fewer.

```
id: work.heading
Where: Large heading above the cards. "Work" is purple.
```
```
My Work
```

```
id: work.label.tools
Where: Small label above the tools list on EVERY project card
```
```
Tools and features
```

> **The card numbers (01, 02, 03) are generated automatically** from the order
> of the projects — you don't need to edit them.

> **Every project currently shows a grey placeholder image.** Send me the
> screenshots and I'll drop them in. Filling in the `link` fields below also
> switches on a clickable arrow badge on each card.

### Project 1

```
id: work.1.name
Where: Project title on the card
```
```
SecureKubeOps Pipeline
```

```
id: work.1.category
Where: Small grey line under the title
```
```
Cloud Engineering
```

```
id: work.1.tools
Where: The tools paragraph on the card
Notes: Comma-separated reads best
```
```
GitHub Actions, Docker, Kubernetes, Minikube, Trivy, Prometheus, Grafana
```

```
id: work.1.link
Where: Makes the card clickable and shows an arrow badge. Currently empty.
Notes: Paste a full URL (https://github.com/...) or leave blank
```
```

```

### Project 2

```
id: work.2.name
Where: Project title on the card
```
```
AwareNet Platform
```

```
id: work.2.category
Where: Small grey line under the title
```
```
DevSecOps
```

```
id: work.2.tools
Where: The tools paragraph on the card
```
```
Docker, Microservices, API Gateway, JWT, RBAC, Postman
```

```
id: work.2.link
Where: Makes the card clickable. Currently empty.
```
```

```

### Project 3

```
id: work.3.name
Where: Project title on the card
```
```
AWS Cloud Automation
```

```
id: work.3.category
Where: Small grey line under the title
```
```
Infrastructure as Code
```

```
id: work.3.tools
Where: The tools paragraph on the card
```
```
Terraform, EC2, Lambda, RDS, CloudWatch, IAM, VPC
```

```
id: work.3.link
Where: Makes the card clickable. Currently empty.
```
```

```

---

# 9. Digital Footprint

The section that reads the visitor's own browser data back to them.

```
id: footprint.eyebrow
Where: Small purple label above the big heading
```
```
Digital Footprint
```

```
id: footprint.title.1
Where: Big heading, first part (white)
```
```
Here's what I can already see
```

```
id: footprint.title.2
Where: Big heading, second part (purple)
```
```
about you.
```

### Card headings

```
id: footprint.card.network
Where: Heading on the first card
```
```
Network
```

```
id: footprint.card.browser
Where: Heading on the second card
```
```
Browser & device
```

```
id: footprint.card.hardware
Where: Heading on the third card
```
```
Hardware
```

```
id: footprint.card.preferences
Where: Heading on the fourth card
```
```
Preferences
```

```
id: footprint.card.fingerprint
Where: Heading on the wide fifth card
```
```
Fingerprint
```

```
id: footprint.card.webrtc
Where: Heading on the wide sixth card
```
```
WebRTC posture check
```

### Row labels

The grey label on the left of each row. The value on the right is read live
from the visitor's browser and can't be edited.

```
id: footprint.rows
Where: Left-hand labels down all six cards, in order
Notes: One per line. Keep them short — long labels squeeze the value.
       Deleting a line removes that row from the site.
```
```
Public IP
City
Region
Country
Postal code
ISP / org
ASN
Browser
OS
Device type
Languages
Referrer
Do Not Track
Global Privacy Control
Cookies enabled
CPU cores
Device memory
Screen
Color depth
Touch support
Connection
Bandwidth
Color scheme
Reduced motion
Browser timezone
UTC offset
GPU
Canvas hash
Audio hash
Combined fingerprint
```

### Messages shown when data is missing

```
id: footprint.msg.notExposed
Where: Appears as the value when the visitor's browser withholds a field
```
```
not exposed by this browser
```

```
id: footprint.msg.lookupFailed
Where: Appears in the Network card rows when the IP lookup service is down
```
```
lookup unavailable
```

```
id: footprint.msg.vpnFlag
Where: Orange warning next to Browser timezone when it disagrees with the
       IP's timezone. The detected timezone is inserted automatically.
```
```
≠ IP timezone — possible VPN
```

```
id: footprint.msg.noReferrer
Where: The Referrer row when someone typed your URL in directly
```
```
(direct visit — no referrer)
```

### WebRTC verdicts

```
id: footprint.webrtc.unsupported
Where: WebRTC card, when the browser has no WebRTC at all
```
```
unsupported
```

```
id: footprint.webrtc.none
Where: WebRTC card, green — nothing was leaked
```
```
✓ No host candidate gathered — nothing leaked
```

```
id: footprint.webrtc.masked
Where: WebRTC card, green — the normal, healthy result for most visitors
Notes: The masked address is appended automatically after this text
```
```
✓ Masked —
```

```
id: footprint.webrtc.exposed
Where: WebRTC card, orange — a real local IP leak
Notes: The leaked address is appended automatically after this text
```
```
Exposed —
```

### Location button

```
id: footprint.divider.label
Where: Small caption sitting in the middle of the horizontal rule above the
       location button
```
```
with your permission
```

```
id: footprint.gps.button
Where: The pill button at the bottom of the section
```
```
Show my precise location
```

```
id: footprint.gps.busy
Where: Replaces the button text while the browser asks for permission
```
```
Requesting…
```

```
id: footprint.gps.unsupported
Where: Error shown if the browser has no location support
```
```
Geolocation is not supported by this browser
```

```
id: footprint.gps.denied
Where: Error shown if the visitor refuses the permission prompt
```
```
Location request denied
```

---

# 10. Tech Stack

The pile of tumbling cubes.

```
id: techstack.heading
Where: Large heading above the cubes
Notes: Currently has a leading space in the code — I'll tidy that
```
```
My Techstack
```

### Cube labels

The word printed on each cube face. Changing one of these means I regenerate
that cube's image, not just the text — tell me the brand colour if you want a
new one, or I'll pick the official one.

```
id: techstack.cubes
Where: Printed across the faces of the floating cubes
Notes: One per line. There are 22 cubes and 8 designs, so each appears about
       three times. Add or remove lines freely.
```
```
DOCKER
K8S
TERRAFORM
AWS
ACTIONS
LINUX
PROMETHEUS
GRAFANA
```

---

# 11. Contact & footer

```
id: contact.heading
Where: Large heading at the top of the final section
```
```
Contact
```

```
id: contact.label.email
Where: Small grey label above your email address
```
```
Email
```

```
id: contact.label.phone
Where: Small grey label above your phone number
```
```
Phone
```

```
id: contact.label.location
Where: Small grey label above your city
```
```
Location
```

```
id: contact.label.social
Where: Small grey label above the social links column
```
```
Social
```

### Social link labels

The words on the four underlined links. The URLs they point to are in
**Section 12**.

```
id: contact.social.github
Where: First underlined link in the Social column
```
```
Github
```

```
id: contact.social.linkedin
Where: Second underlined link
```
```
Linkedin
```

```
id: contact.social.email
Where: Third underlined link — opens the visitor's mail app
```
```
Email
```

```
id: contact.social.resume
Where: Fourth underlined link — opens your CV PDF
```
```
Resume
```

### Credit line

```
id: contact.credit
Where: Bottom right. Your name is appended in purple automatically.
Notes: Renders on two lines. The year updates itself — don't hardcode it.
```
```
Designed and Developed by
```

---

# 12. Your details

These appear in several places at once. Change them here and they update
everywhere — nav bar, contact section, terminal, everything.

```
id: personal.fullName
Where: Top-left of the nav, the loading screen, the footer credit, and the
       shell banner
```
```
Saim Zaib
```

```
id: personal.initials
Where: The shell prompt ("sz ~ $") and the shell title bar. Also the letters
       on the browser-tab icon — changing those needs a new icon file, which
       I'll handle.
Notes: Two letters
```
```
SZ
```

```
id: personal.email
Where: Middle of the nav bar, the Contact section, and the shell's `contact`
       command. Every one of them is a working mailto link.
```
```
saimzaib.official@gmail.com
```

```
id: personal.phone
Where: Contact section — displayed form
```
```
+92 300 0264566
```

```
id: personal.phoneDial
Where: The number actually dialled when someone taps the phone link
Notes: No spaces. Keep the country code.
```
```
+923000264566
```

```
id: personal.location
Where: Contact section, and the shell banner
```
```
Islamabad, Pakistan
```

```
id: personal.github
Where: The GitHub icon in the left rail, the Contact link, and the shell
Notes: Full URL
```
```
https://github.com/saimcyber
```

```
id: personal.linkedin
Where: The LinkedIn icon in the left rail, the Contact link, and the shell
Notes: Full URL
```
```
https://linkedin.com/in/saimzaib
```

---

# 13. Side rail

The icons down the left edge and the vertical button on the right.

```
id: rail.resumeButton
Where: Vertical text on the right edge of the screen, always visible
Notes: Max ~8 characters — it's rotated 90° and constrained by screen height
```
```
RESUME
```

These are read aloud by screen readers for the four icons in the left rail.
Not visible on screen.

```
id: rail.aria.github
Where: Screen-reader label for the GitHub icon
```
```
GitHub
```

```
id: rail.aria.linkedin
Where: Screen-reader label for the LinkedIn icon
```
```
LinkedIn
```

```
id: rail.aria.email
Where: Screen-reader label for the mail icon
```
```
Email
```

```
id: rail.aria.resume
Where: Screen-reader label for the document icon
```
```
Resume
```

---

# 14. The hidden shell

Opens when a visitor presses `~` or clicks the "~ shell" pill. Most visitors
never see this, so it's optional — but it's the most distinctive thing on the
site.

```
id: shell.titlebar
Where: Title bar of the shell window. Your initials are added automatically,
       so this renders as "sz@portfolio — zsh".
```
```
@portfolio — zsh
```

```
id: shell.closeButton
Where: Top-right of the shell window
```
```
esc
```

```
id: shell.banner
Where: Second line of the shell when it opens. The first line is your name
       and location, added automatically.
```
```
type 'help' for commands, 'exit' or Esc to close
```

### Command list

Shown when someone types `help`. **The word on the left is the actual command
they type** — renaming it changes what has to be typed. The text on the right
is just the description.

```
id: shell.help
Where: Output of the `help` command
Notes: One per line. Keep the command name and its description separated by
       spaces so the columns line up.
```
```
whoami       who you're looking at
skills       what I work with
projects     things I've built
resume       open my CV (PDF)
contact      how to reach me
kubectl      get nodes | get pods  (live from the hero scene)
recon        what this site already knows about you
clear        clear the screen
exit         close this shell
```

### `whoami` output

Your name is printed first automatically, then these two lines.

```
id: shell.whoami.1
Where: Second line of the `whoami` output
```
```
DevOps & Cloud Engineer — Kubernetes, Terraform, CI/CD.
```

```
id: shell.whoami.2
Where: Third line of the `whoami` output
```
```
Cyber Security undergrad at FAST NUCES, Islamabad.
```

### Other shell messages

```
id: shell.recon.busy
Where: Shown while the `recon` command gathers data
```
```
gathering signals…
```

```
id: shell.recon.footer
Where: Last line of the `recon` output, pointing at the section on the page
```
```
full breakdown below
```

```
id: shell.kubectl.usage
Where: Shown if someone types `kubectl` with no valid sub-command
```
```
usage: kubectl get nodes | kubectl get pods
```

```
id: shell.error.notFound
Where: Shown for an unrecognised command. The command typed is inserted
       before this automatically, as "command not found: xyz".
```
```
type 'help' for commands
```

```
id: shell.sudo.1
Where: Easter egg — first line shown if someone types `sudo`
```
```
nice try.
```

```
id: shell.sudo.2
Where: Easter egg — second line
```
```
this incident will be reported.
```

### Fake cluster app names

These appear as pod names in the `kubectl get pods` output, and they're the
services running on the 3D cluster in the hero. Worth matching your real
project names.

```
id: shell.cluster.apps
Where: Pod names in `kubectl get pods`
Notes: One per line. Lowercase with hyphens, like real Kubernetes names.
```
```
securekubeops-api
awarenet-gateway
trivy-scanner
prometheus
grafana
argocd-repo
```

---

# 15. Things that aren't plain text

Listed so you know they exist. These need a file or an image change, not a
text edit — just tell me what you want and I'll do it.

| What | Where it shows | To change it |
|---|---|---|
| **Share image** | The picture on the card when your link is pasted into LinkedIn or WhatsApp. Currently has your name, "DevOps & Cloud Engineer", "I automate and secure infrastructure at scale", and five tags baked into it as a picture. | Editing `meta.share.*` above will **not** change this — it's a PNG. Tell me the new wording and I'll regenerate it. |
| **Browser tab icon** | The little square in the browser tab — currently "SZ" in purple. | Follows `personal.initials`, but needs the icon regenerating. Tell me and I'll do it. |
| **Project images** | All three project cards currently show a grey placeholder. | Send me the screenshots. |
| **Tech stack cubes** | The floating cubes. | See `techstack.cubes` above — each label is a generated image. |
| **Your CV** | The Resume links in the nav rail, Contact section, and the shell's `resume` command. | Send me the new PDF and I'll swap the file. |
| **Live browser data** | Every value on the right-hand side of the Digital Footprint rows. | Read from the visitor's own browser at page load. Not editable — only the labels are. |
| **Cluster node names** | The `ip-10-0-x-x` names in `kubectl get nodes`. | Generated randomly on each page load to look like real AWS nodes. |
| **kubectl table headers** | `NAME / STATUS / ROLE / CPU` and the status words `Running`, `Pending`, `Ready`, `NotReady` in the shell. | Left out on purpose — they copy real Kubernetes output, and changing them breaks the illusion. Ask if you want them changed anyway. |
