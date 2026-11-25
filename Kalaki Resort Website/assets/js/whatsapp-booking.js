/**
 * Kalaki Resort: WhatsApp booking and contact forms.
 *
 * This is a static site, so there is no server. When a guest presses "Book Now",
 * WhatsApp opens with their booking details already typed out for the resort number
 * below. The guest then taps Send inside WhatsApp.
 *
 * TO CHANGE THE NUMBER THAT RECEIVES BOOKINGS: edit WHATSAPP_NUMBER.
 * Use the country code and number, digits only: no +, spaces or dashes.
 * Example: +256 785 155 993 becomes 256785155993
 */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "256785155993";
  var RESORT_NAME = "Kalaki Resort";

  var ROOMS = {
    deluxe: "Deluxe Room",
    double: "Double Room",
    standard: "Standard Room"
  };

  var OFFERS = {
    "weekend-getaway": "Weekend Getaway",
    "extended-stay": "Extended Stay Deal",
    "advance-booking": "Advance Booking"
  };

  /* ---------- small helpers ---------- */

  function byId(id) { return document.getElementById(id); }

  function oneLine(id) {
    var el = byId(id);
    return el ? el.value.replace(/\s+/g, " ").trim() : "";
  }

  function multiLine(id) {
    var el = byId(id);
    return el ? el.value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : "";
  }

  function cap(text, max) {
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseISO(s) {
    var p = s.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }

  function addDaysISO(s, n) {
    var d = new Date(parseISO(s) + n * 86400000);
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  }

  function nightsBetween(a, b) {
    return Math.round((parseISO(b) - parseISO(a)) / 86400000);
  }

  function prettyDate(s) {
    return new Date(parseISO(s)).toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
    });
  }

  function count(n, singular, pluralForm) {
    return n + " " + (n === 1 ? singular : (pluralForm || singular + "s"));
  }

  function whatsappUrl(text) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }

  function showStatus(url) {
    var box = byId("form-status");
    if (!box) return;
    box.innerHTML = "";
    var msg = document.createElement("span");
    msg.textContent = "WhatsApp is opening with your details ready. Press Send in WhatsApp to finish. ";
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "If nothing opened, tap here.";
    box.appendChild(msg);
    box.appendChild(link);
    box.className = "form-status is-visible";
  }

  function openWhatsApp(text) {
    var url = whatsappUrl(text);
    var win = null;
    try { win = window.open(url, "_blank"); } catch (e) { win = null; }
    if (win) { try { win.opener = null; } catch (e) { /* ignore */ } }
    showStatus(url);
  }

  /* ---------- booking form ---------- */

  function initBooking() {
    var form = byId("booking-form");
    if (!form) return;

    var checkIn = byId("check-in");
    var checkOut = byId("check-out");
    var phone = byId("guest-phone");
    var summary = byId("stay-summary");
    var offerNote = byId("offer-note");
    var offerName = "";

    // Prefill from the link the guest came from, e.g. booking.html?room=double
    var params = new URLSearchParams(window.location.search);
    var roomKey = params.get("room");
    if (roomKey && ROOMS[roomKey]) byId("room-type").value = roomKey;
    var offerKey = params.get("offer");
    if (offerKey && OFFERS[offerKey]) {
      offerName = OFFERS[offerKey];
      if (offerNote) {
        offerNote.textContent = "Offer selected: " + offerName;
        offerNote.hidden = false;
      }
    }

    // Dates: no past check-in, check-out always after check-in
    var today = todayISO();
    checkIn.min = today;
    checkOut.min = addDaysISO(today, 1);

    function updateDates() {
      if (checkIn.value) {
        var next = addDaysISO(checkIn.value, 1);
        checkOut.min = next;
        if (checkOut.value && checkOut.value < next) checkOut.value = next;
      }
      var ok = checkIn.value && checkOut.value && checkOut.value > checkIn.value;
      checkOut.setCustomValidity(
        checkIn.value && checkOut.value && !ok ? "Check-out must be after check-in." : ""
      );
      if (summary) {
        summary.textContent = ok
          ? count(nightsBetween(checkIn.value, checkOut.value), "night")
          : "Choose your dates";
      }
    }
    checkIn.addEventListener("change", updateDates);
    checkOut.addEventListener("change", updateDates);
    updateDates();

    phone.addEventListener("input", function () {
      var digits = phone.value.replace(/\D/g, "").length;
      phone.setCustomValidity(digits < 7 ? "Enter a phone number with at least 7 digits." : "");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      updateDates();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var adults = parseInt(byId("adults").value, 10) || 1;
      var children = parseInt(byId("children").value, 10) || 0;
      var rooms = parseInt(byId("rooms").value, 10) || 1;
      var nights = nightsBetween(checkIn.value, checkOut.value);
      var room = ROOMS[byId("room-type").value] || byId("room-type").value;
      var email = oneLine("guest-email");
      var requests = cap(multiLine("requests"), 600);

      var lines = [
        "*Booking request - " + RESORT_NAME + "*",
        "",
        "*Name:* " + oneLine("guest-name"),
        "*Phone:* " + oneLine("guest-phone")
      ];
      if (email) lines.push("*Email:* " + email);
      lines.push(
        "*Room:* " + room + (rooms > 1 ? " (" + rooms + " rooms)" : ""),
        "*Check-in:* " + prettyDate(checkIn.value),
        "*Check-out:* " + prettyDate(checkOut.value) + " (" + count(nights, "night") + ")",
        "*Guests:* " + count(adults, "adult") + (children ? ", " + count(children, "child", "children") : "")
      );
      if (offerName) lines.push("*Offer:* " + offerName);
      if (requests) lines.push("*Special requests:* " + requests);
      lines.push("", "Please confirm availability and the total price. Thank you.");

      openWhatsApp(lines.join("\n"));
    });
  }

  /* ---------- contact form ---------- */

  function initContact() {
    var form = byId("whatsapp-contact-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var phone = oneLine("contact-phone");
      var email = oneLine("contact-email");
      var lines = [
        "*Message from the website - " + RESORT_NAME + "*",
        "",
        "*Name:* " + oneLine("contact-name")
      ];
      if (phone) lines.push("*Phone:* " + phone);
      if (email) lines.push("*Email:* " + email);
      lines.push("*Subject:* " + cap(oneLine("contact-subject"), 120), "", cap(multiLine("contact-message"), 900));

      openWhatsApp(lines.join("\n"));
    });
  }

  initBooking();
  initContact();
})();
