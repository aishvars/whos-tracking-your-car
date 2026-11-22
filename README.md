# Who's Tracking Your Car?

A public-interest website about automated license plate readers (ALPRs) in Pittsburgh and Pennsylvania. It maps the cameras volunteers have documented, explains how ALPR data moves, and gives residents tools to act: find their legislators, write to them, and file a Pennsylvania Right-to-Know request.

The campaign position: Pennsylvania should regulate ALPRs, not ban them. See the site's Home page for the four proposed requirements.

This is a student project for a graduate course on law, ethics and emerging technology policy at Carnegie Mellon University. It is advocacy, it says so, and it links its sources on every page. It is information, not legal advice.

## Run it locally

It is plain HTML, CSS and JavaScript with no build step:

```
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Data and credits

- Camera, place and vendor data: &copy; OpenStreetMap contributors, available under the [Open Database License](https://opendatacommons.org/licenses/odbl/). The camera count is a dated snapshot of volunteer-mapped cameras, so it is incomplete. The site shows the date of the data.
- Inspired by [DeFlock](https://deflock.org/), an open-source project that maps license plate readers.
- Maps: [Leaflet](https://leafletjs.com/) (BSD 2-Clause). Address lookup: [Nominatim](https://nominatim.org/). Driving routes: [OSRM](https://project-osrm.org/).
- Nothing you type on the site is collected or stored. Address and trip searches are sent from your browser directly to Nominatim and OSRM.
