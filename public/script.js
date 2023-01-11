function get() {
  $('table').on('click', 'a.editingTRbutton',function (ele) {

      var id = $(this).attr("data-id");
      
      // Ajax config
      $.ajax({
        type: "GET", //we are using GET method to get data from server side
        url: "http://47.87.213.40/api/getDataById/"+id, // get the route value
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
        },
      });
    }
  );
}


$(document).ready(function () {
  // Get the data and view to modal
  get();
});
