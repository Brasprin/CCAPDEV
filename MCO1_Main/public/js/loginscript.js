$(document).ready(function () {

  // Register functionality
  $(".register-submit").on("click", function (event) {
    event.preventDefault(); // Prevent default form submission
    const username = $("#reg-username").val();
    const email = $("#reg-email").val();
    const password = $("#reg-password").val();
    const usertype = $("#user-type").val();

    $.ajax({
      url : "/api/register",
      method : "POST",
      data : { username, email, password, usertype },
      success : function (response) {
        alert(response.message);
        console.log(response);
      },
      error : function (xhr) {
        alert(xhr.responseJSON.error);
        console.log(xhr);
      }, 
    });
  });

  // Login functionality
  $(".login-submit").on("click", function (event) {
    event.preventDefault(); // Prevent default form submission
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    const rememberMe = $("#remember-me").is(":checked");

    $.ajax({
      url : "/api/login",
      method : "POST",
      data : { email, password },
      success : function (response) {
        alert(response.message);
        console.log(response);
        
        if(rememberMe) {
          localStorage.setItem("login-email", email);
          localStorage.setItem("login-password", password);
        } else {
          localStorage.removeItem("login-email");
          localStorage.removeItem("login-password");
        }

        $(".wrapper.action-popup").hide();
        $("#welcome-message, header").fadeIn("slow");

        setTimeout(() => {
          $("#welcome-message, header").hide();
          window.location.href = "/reserveSlot";
        }, 2500);
      },
      error: function (xhr) {
        alert(xhr.responseJSON.error);
      },    
    });
  });

  // Toggle between login and register forms
  $(".reg-link").on("click", function (event) {
    event.preventDefault();
    $(".wrapper").addClass("action");
  });

  $(".login-link").on("click", function (event) {
    event.preventDefault();
    $(".wrapper").removeClass("action");
  });

  $(".btnLogin-popup").on("click", function () {
    if ($(".wrapper").hasClass("action-popup")) {
      $(".wrapper").removeClass("action-popup");
      console.log("Removed action-popup");
    } else {
      $(".wrapper").addClass("action-popup");
      console.log("Added action-popup");
    }
  });
});
