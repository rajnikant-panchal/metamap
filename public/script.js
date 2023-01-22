function get() {
  $('table').on('click', 'a.editingTRbutton',function (ele) {

      var id = $(this).attr("data-id");
      
      // Ajax config
      $.ajax({
        type: "GET", //we are using GET method to get data from server side
        url: "https://httpwebhook.herokuapp.com/api/getDataById/"+id, // get the route value
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
    }
  );
}

function sendData() {
  $('table').on('click', 'a.sendTRbutton',function (ele) {

    let currentRow=$(this).closest("tr"); 
    
    let col1=currentRow.find("td:eq(0)").text().trim();
    let col2=currentRow.find("td:eq(1)").text().trim();
    let col3=currentRow.find("td:eq(2)").text().trim();
    let col4=currentRow.find("td:eq(3)").text().trim();
    let col5=currentRow.find("td:eq(4)").text().trim();
    let col6=currentRow.find("td:eq(5)").text().trim();
    let col7=currentRow.find("td:eq(6)").text().trim();
    let col8=currentRow.find("td:eq(7)").text().trim();
    let col9=currentRow.find("td:eq(8)").text().trim();
    let col10=currentRow.find("td:eq(9)").text().trim();
    let col11=currentRow.find("td:eq(10)").text().trim();
    let col12=currentRow.find("td:eq(11)").text().trim();
    
    let jsonData = {
      "verificationId": col1,
      "identityStatus": col2,
      "name": col3,
      "documentNumber": col4,
      "dateOfBirth": col5,
      "phone": col6,
      "email": col7,
      "gender": col8,
      "nationality": col9,
      "add field1": col10,
      "add field2": col11,
      "add field3": col12
    }
    
    $.ajax({
      type: "POST",
      url: "https://webhook.site/922c12a8-b0e8-4981-ae94-c718ba5981f1",
      data: jsonData,
      dataType: "json",
      beforeSend: function () {
        
      },
      success: function (response) {
        alert("Data sent successfully");
        return false;
      },
    });
  }
);
}

$(document).ready(function () {
  // Get the data and view to modal
  get();
  sendData();
});
