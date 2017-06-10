/* eslint-disable */

$('.btn-shortener').on('click', function () {
  $.ajax({
    url: '/api/shortener',
    type: 'POST',
    dataType: 'JSON',
    data: {
      url: $('#url-field').val()
    },
    success: function (data) {
      var resultHTML = '<a class="result" href="' + data.short_url + '">' +
        data.short_url + '</a>';
      $('#link').html(resultHTML);
      $('#link').hide().fadeIn('slow');
    }
  });
});
