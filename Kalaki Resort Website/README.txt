KALAKI RESORT WEBSITE (static: HTML, CSS and JavaScript only, no server needed)

OPEN IT
  Double-click index.html, or upload the whole folder to any web host.

BOOKINGS GO TO WHATSAPP
  The Book Now button on booking.html (and the contact form) opens WhatsApp with the
  guest's details already written out. The guest taps Send. Nothing is sent until they do.
  The number that receives them is set at the top of:  assets/js/whatsapp-booking.js
      var WHATSAPP_NUMBER = "256785155993";
  Digits only, with the country code, no + or spaces.

PICTURES
  Every picture is a placeholder for now (assets/img/placeholders/).
  When you have photos, put them in assets/img/ and change the src of that picture, e.g.
      <img src="assets/img/placeholders/ph-room-a.svg" ...>   becomes
      <img src="assets/img/deluxe-room.jpg" ...>
  On the Gallery page also change the matching href="..." (it opens the large view).
  Use .jpg or .webp photos about 1600 px wide.

STILL TO CHECK BEFORE GOING LIVE
  - Room prices on rooms.html and the room pages are still the template's dollar amounts.
  - Gallery captions and some amenities (spa, fitness, pool) came from the template.
  - The footer links (Services, Terms, Privacy) and social icons are not linked yet.
