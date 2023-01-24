function get() {
  $("table").on("click", "a.editingTRbutton", function (ele) {
    var id = $(this).attr("data-id");

    // Ajax config
    $.ajax({
      type: "GET", //we are using GET method to get data from server side
      url: "/api/getDataById/" + id, // get the route value
      beforeSend: function () {
        //We add this before send to disable the button once we submit it so that we prevent the multiple click
      },
      success: function (response) {
        $('#modalForm [name="id"]').val(response._id);
        $('#modalForm [name="verificationId"]').val(response.verificationId);
        $('#modalForm [name="identityStatus"]').val(response.identityStatus);
        $('#modalForm [name="documentNumber"]').val(response.documentNumber);
        $('#modalForm [name="name"]').val(response.name);
        $('#modalForm [name="field1"]').val(response.field1);
        $('#modalForm [name="field2"]').val(response.field2);
        $('#modalForm [name="field3"]').val(response.field3);
        $('#modalForm [name="dateOfBirth"]').val(response.dateOfBirth);
        $('#modalForm [name="phoneNumber"]').val(response.phoneNumber);
        $('#modalForm [name="emailAddress"]').val(response.emailAddress);
        $('#modalForm [name="gender"]').val(response.gender);
        $('#modalForm [name="nationality"]').val(response.nationality);
      },
    });
  });
}

function sendData() {
  $("table").on("click", "a.sendTRbutton", function (ele) {
    var id = $(this).attr("data-id");

    $.ajax({
      type: "GET", //we are using GET method to get data from server side
      url: "/api/getDataById/" + id, // get the route value
      beforeSend: function () {
        //We add this before send to disable the button once we submit it so that we prevent the multiple click
      },
      success: function (response) {
        let jsonData = {
          verificationId: response.verificationId,
          identityStatus: response.identityStatus,
          name: response.name,
          documentNumber: response.documentNumber,
          dateOfBirth: response.dateOfBirth,
          phone: response.phoneNumber,
          email: response.emailAddress,
          gender: response.gender,
          nationality: response.nationality,
          "add field1": response.field1,
          "add field2": response.field2,
          "add field3": response.field3,
        };

        $.ajax({
          type: "POST",
          url: "https://webhook.site/922c12a8-b0e8-4981-ae94-c718ba5981f1",
          data: jsonData,
          dataType: "json",
          beforeSend: function () {},
          success: function (response) {
            alert("Data sent successfully");
            return false;
          },
        });
      },
    });
  });
}

$(document).ready(function () {
  // Get the data and view to modal
  get();
  sendData();

  var table = $("#example").DataTable({
    ajax: "/api/getAllData",
    columns: [
      {
        className: "dt-control",
        orderable: false,
        data: null,
        defaultContent: "",
      },
      { data: "verificationId" },
      { data: "identityStatus" },
      { data: "name" },
      { data: "documentNumber" },
      { data: "dateOfBirth" },
      { data: "phoneNumber" },
      { data: "emailAddress" },
      { data: "action" },
    ],
    order: [[1, "asc"]],
  });

  // Add event listener for opening and closing details
  $("#example tbody").on("click", "td.dt-control", function () {
    var tr = $(this).closest("tr");
    var row = table.row(tr);

    if (row.child.isShown()) {
      // This row is already open - close it
      row.child.hide();
      tr.removeClass("shown");
    } else {
      // Open this row
      row.child(format(row.data())).show();
      tr.addClass("shown");
    }
  });
});

function format(d) {
  // `d` is the original data object for the row
  console.log(d);
  return (
    '<table class="table table-bordered" border="0" style="padding-left:50px;">' +
    "<tr>" +
    "<th>Gender</th>" +
    "<th>Nationality:</th>" +
    "<th>Field 1</th>" +
    "<th>Field 2</th>" +
    "<th>Field 3:</th>" +
    "</tr>" +
    "<tr>" +
    "<td>" +
    (d.gender ? d.gender : "-") +
    "</td>" +
    "<td>" +
    (d.nationality ? d.nationality : "-") +
    "</td>" +
    "<td>" +
    (d.field1 ? d.field1 : "-") +
    "</td>" +
    "<td>" +
    (d.field2 ? d.field2 : "-") +
    "</td>" +
    "<td>" +
    (d.field3 ? d.field3 : "-") +
    "</td>" +
    "</tr>" +
    "</table>"
  );
}
