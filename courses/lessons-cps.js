/* Lessons for Computer Problem Solving. Steps are documented in study-lessons.js; `q` steps
   point at a question in the course's bank. Lesson ids are permanent. */
(window.STUDY_LESSONS = window.STUDY_LESSONS || {})['fbla-cps'] = [
  {
    id: 'cps-boot', unit: 'os', title: 'What happens when you press power',
    steps: [
      { type: 'stages', title: 'From power button to desktop', visual: 'boot-chain', stages: [
        { name: 'Power', text: 'The power supply wakes up and sends stable voltage to the board. **If nothing lights up or spins, the problem is here**: the outlet, the cable or the power supply.' },
        { name: 'POST', text: 'Firmware (UEFI or BIOS) runs the Power-On Self-Test on the CPU, RAM and video. **Beeps and a blank screen mean it failed here**, before any operating system code has run.' },
        { name: 'Bootloader', text: 'Firmware follows the boot order to find a drive and starts its bootloader. **"BOOTMGR is missing" lives here**. Fix it with Startup Repair, not a new drive.' },
        { name: 'Kernel', text: 'The kernel and drivers load. **A blue screen right after a driver update lives here**. Safe Mode loads only the basics, so you can roll that driver back.' },
        { name: 'Login', text: 'Windows reaches the sign-in screen and loads your profile. **If only one account has problems**, the profile is the suspect, not the system.' }
      ]},
      { type: 'match', prompt: 'A symptom tells you **how far startup got**. Match each one to its stage.', pairs: [
        ['No lights, no fans', 'Power'],
        ['Beep code, no logo', 'POST'],
        ['"BOOTMGR is missing"', 'Bootloader'],
        ['Blue screen after new driver', 'Kernel'],
        ['Only one user has issues', 'Login']
      ], why: 'Find the furthest stage that worked, and you\'ve narrowed down the cause.' },
      { type: 'q', ref: 'os-10' },
      { type: 'q', ref: 'os-12' },
      { type: 'q', ref: 'os-13' }
    ]
  },
  {
    id: 'cps-packets', unit: 'net', title: 'How data gets across a network',
    steps: [
      { type: 'stages', title: 'Follow one packet', visual: 'net-journey', stages: [
        { name: 'Laptop', text: 'Your file is split into **packets**, each labeled with the destination **IP address**. The first stop on the local network is addressed by **MAC address**.' },
        { name: 'Switch', text: 'A switch connects devices **within one network**. It reads the MAC address and sends the frame out only the correct port.' },
        { name: 'Router', text: 'A router connects **different networks**. It reads the IP address, picks the next hop and **rewrites the MAC addresses**. The IP addresses stay the same (ignoring NAT).' },
        { name: 'Modem', text: 'A modem converts your network\'s traffic into the signal your internet provider uses, such as cable or DSL.' },
        { name: 'Server', text: 'The packets arrive, possibly out of order. **TCP** puts them back together and asks again for any that were lost. **UDP** doesn\'t bother, which suits live video.' }
      ]},
      { type: 'match', prompt: 'Which device does which job?', pairs: [
        ['Forwards by MAC address', 'Switch'],
        ['Forwards between networks by IP', 'Router'],
        ['Converts the ISP\'s signal', 'Modem'],
        ['Bridges Wi-Fi to the wired LAN', 'Access point']
      ], why: 'A home "router" is usually all four of these in a single box, so the test may separate jobs you think of as one device.' },
      { type: 'q', ref: 'net-18' },
      { type: 'q', ref: 'net-20' },
      { type: 'q', ref: 'net-05' }
    ]
  },
  {
    id: 'cps-address', unit: 'net', title: 'How a device gets online',
    steps: [
      { type: 'stages', title: 'A new device has no address. Now what?', visual: 'dora', stages: [
        { name: 'Discover', text: 'The client has no IP, so it broadcasts to the whole network, looking for a DHCP server.' },
        { name: 'Offer', text: 'A DHCP server replies with an address it can lend out.' },
        { name: 'Request', text: 'The client formally asks for that address. This step is a broadcast too, so any other servers know the decision.' },
        { name: 'Acknowledge', text: 'The server confirms it and gives the lease details: IP address, subnet mask, default gateway and DNS server.' }
      ]},
      { type: 'order', prompt: 'Remember it as **DORA**. Put the messages in order.', items: ['Discover', 'Offer', 'Request', 'Acknowledge'], why: 'Discover, Offer, Request, Acknowledge. The client asks twice, and the server answers twice.' },
      { type: 'teach', title: 'Read the clues', body: 'A **169.254.x.x** address means DHCP failed, and the device gave itself an APIPA address.\n\nIf you **can ping 8.8.8.8 but websites by name fail**, your connection works and **DNS** is broken. DNS turns names into IPs, and DHCP hands out addresses. They\'re easy to mix up, and test questions often try to make you do that.' },
      { type: 'sort', prompt: 'Which service is the likely problem?', buckets: ['DHCP', 'DNS'], items: [
        ['IP address is 169.254.12.7', 0, 'Yes. APIPA means no DHCP server answered.'],
        ['Ping to 8.8.8.8 works, but google.com fails', 1, 'Yes. Reaching an IP but not a name points to DNS.'],
        ['A new laptop gets no IP on the LAN', 0, 'Yes. Handing out addresses is DHCP\'s job.'],
        ['A website\'s name resolves to the wrong address', 1, 'Yes. Name-to-address lookups are DNS.']
      ]},
      { type: 'q', ref: 'net-08' },
      { type: 'q', ref: 'net-17' },
      { type: 'q', ref: 'net-09' }
    ]
  },
  {
    id: 'cps-trouble', unit: 'hw', title: 'Think like a technician',
    steps: [
      { type: 'teach', title: 'There is a set method', body: 'Good technicians don\'t swap parts and hope. Test questions often give you a situation and ask **what comes next**, so the order of the steps is worth points by itself.\n\nThe rule for choosing what to check: **start with what is simplest and most likely**. Check the outlet before the power supply, and the power supply before the motherboard.' },
      { type: 'order', prompt: 'Put the troubleshooting method in order.', items: ['Identify the problem', 'Establish a theory of probable cause', 'Test the theory', 'Plan and implement the fix', 'Verify full functionality', 'Document everything'], why: 'Verify before documenting, because a fix you haven\'t confirmed isn\'t a fix yet.' },
      { type: 'q', ref: 'hw-16' },
      { type: 'q', ref: 'hw-17' },
      { type: 'q', ref: 'hw-19' },
      { type: 'q', ref: 'hw-18' }
    ]
  },
  {
    id: 'cps-attacks', unit: 'sec', title: 'Spot the attack',
    steps: [
      { type: 'stages', title: 'What is security protecting?', visual: 'cia', stages: [
        { name: 'Confidentiality', text: 'Only the right people can **see** the data. Encryption and permissions protect it. A leaked customer list is a confidentiality failure.' },
        { name: 'Integrity', text: 'The data stays **accurate and unaltered**. Hashes and audit logs protect it. Secretly changed payment amounts are an integrity failure.' },
        { name: 'Availability', text: 'People can **reach** the data when they need it. Backups and redundancy protect it. A site knocked offline by a DDoS is an availability failure.' }
      ]},
      { type: 'sort', prompt: 'Was this mainly about **people** or about **technology**?', buckets: ['Social engineering', 'Technical attack'], items: [
        ['Following someone through a badge door', 0, 'Yes. That\'s tailgating, which exploits courtesy.'],
        ['Thousands of devices flood a website', 1, 'Yes. That\'s a DDoS attack.'],
        ['A fake "IT" caller asks for a password', 0, 'Yes. That\'s vishing, or voice phishing.'],
        ['Database commands typed into a login form', 1, 'Yes. That\'s SQL injection.'],
        ['A text message with a fake bank link', 0, 'Yes. That\'s smishing, or SMS phishing.']
      ]},
      { type: 'match', prompt: 'Name the malware.', pairs: [
        ['Looks like a free game, gives remote access', 'Trojan'],
        ['Spreads across networks on its own', 'Worm'],
        ['Needs a host file and a user to run it', 'Virus'],
        ['Encrypts files and demands payment', 'Ransomware']
      ], why: 'Worm vs. virus is the classic trap: a worm spreads by itself, and a virus needs a host.' },
      { type: 'q', ref: 'sec-13' },
      { type: 'q', ref: 'sec-04' },
      { type: 'q', ref: 'sec-10' }
    ]
  },
  {
    id: 'cps-laser', unit: 'prn', title: 'Inside a laser printer',
    steps: [
      { type: 'stages', title: 'Seven steps, every page', visual: 'laser-cycle', stages: [
        { name: 'Processing', text: 'The printer turns the print job into an image of the page in its memory.' },
        { name: 'Charging', text: 'A roller or corona gives the drum an even negative charge.' },
        { name: 'Exposing', text: 'A laser writes the image onto the drum, changing the charge wherever toner should stick.' },
        { name: 'Developing', text: 'Toner clings to the exposed parts of the drum. **Low toner shows up here as faded pages.**' },
        { name: 'Transferring', text: 'The transfer roller pulls the toner off the drum and onto the paper.' },
        { name: 'Fusing', text: 'Heat and pressure melt the toner into the paper. **If toner smears when rubbed, the fuser is failing.**' },
        { name: 'Cleaning', text: 'A blade scrapes leftover toner off the drum. **A scratched drum or poor cleaning causes repeating lines or ghost images.**' }
      ]},
      { type: 'match', prompt: 'A print defect tells you which part to suspect.', pairs: [
        ['Toner smears off the page', 'Fuser'],
        ['A dark line in the same place on each page', 'Drum'],
        ['The whole page is pale and faded', 'Low toner'],
        ['Inkjet page has missing lines', 'Clogged nozzles']
      ], why: 'Only inkjets have nozzles, and only lasers have fusers. Wrong answers often borrow parts from the other printer type.' },
      { type: 'q', ref: 'prn-06' },
      { type: 'q', ref: 'prn-07' },
      { type: 'q', ref: 'prn-08' }
    ]
  }
];
