$(function (){
	$('#write_btn').click(write_article);
	$('#delete_btn').click(function() {
		$('#delete_form').removeClass('error').toggle()[0].reset();
		$('#delete_form span').remove();
	});
	$('#reply_btn').click(function() {
		$('#write_modal').modal('show');
		$('#write_form .reply_to').remove();
		$('#write_form').prepend('<div class="reply_to" style="margin-bottom:1em;"><button class="close">&times;</button><input type="hidden" id="parent_id" value="' + $('#no').attr('value') + '" /><span class="label label-info">Reply to</span> ' + $('#title').html() + '</div>');
		$('#write_form .reply_to .close').click(function() { $('#write_form .reply_to').remove(); });
	});
	$('#delete_form').submit(delete_article);
	reload_article_list();
});

function reload_article_list(){
	$.ajax({
		type: "POST",
		url: "list/",
		dataType: "json",
	}).done(function (data) {
		var items = [];
		$.each(data, function(no, article){
			items.push('<li id="art_' + article['id'] + '"> <a href="#">' + article['title'] + '</a></li>');
		});

		$('#article-list li:not(:first)').remove();
		$('#article-list').append(items.join('\n'));
		$('#article-list li:not(:first)').click(load_article);
		highlight_current_article();
	});	
}

function highlight_current_article(){
	var art_no = $('#no').attr('value');
	if(!art_no) return;
	$('#article-list .active').removeClass('active')
	$('#art_'+art_no).addClass('active');
}

error_html_head = "<div class='alert'><button type='button' class='close' data-dismiss='alert'>x</button><strong>Error!</strong> ";

error_html_tail = "</div>";

function load_article(){
	$.ajax({
		type: "POST",
		url: "read/",
		data: {"id": $(this).attr('id').slice(4)},
		dataType: "json"
	}).done(function (data) {
		$('.alert').remove();
		if(data['success'] == 0){
			$('#article-body').parent().prepend(error_html_head + data['error'] + error_html_tail);
		}
		else {
			$('#no').attr('value', data['article']['id']);
			$('#title').html(data['article']['title']);
			$('#content').html(data['article']['content']);
			$('#meta').html(data['article']['author'] + ', ' + data['article']['date']);

			$('#article-body .reply_to').remove();
			if(data['article']['parent_id']){
				$('#article-body').prepend('<div class="reply_to" style="margin-bottom:1em;"><span class="label label-info">Reply to</span> ' + $('#art_' + data['article']['parent_id'] + ' a').html() + '</div>');
			}

			highlight_current_article();
			$('#article-actions').show();
			$('#delete_form').hide();
		}
	});
}

function write_article(){
	$('#write_modal .alert').remove();
	var title = $('#write_title').attr('value');
	var content = $('#write_content').attr('value');
	var author = $('#write_author').attr('value');
	var password = $('#write_password').attr('value');

	var empty = '';

	if(!author) empty = 'Author';
	else if(!password) empty = 'Password';
	else if(!title) empty = 'Title';
	else if(!content) empty = 'Content';

	if(empty)
		$('#write_form').parent().prepend(error_html_head + empty + ' is missing!' + error_html_tail);
	else {
		var post_data = {"title": title, "content": content, "author": author, "password": password};
		if($('#parent_id').length != 0)
			post_data['parent'] = $('#parent_id').attr('value');
		$.ajax({
			type: "POST",
			url: "write/",
			data: post_data,
			dataType: "json"
		}).done(function (data) {
			$('#write_modal .alert').remove();
			if(data['success'] == 0){
				$('#write_form').parent().prepend(error_html_head + data['error'] + error_html_tail);
			}
			else {
				$('#write_form')[0].reset();
				$('#write_modal button.close').click();
				reload_article_list();
			}
		});
	}
}

function delete_article(){
	$('#delete_form span').remove();
	var password = $('#delete_form input').attr('value');
	var art_no = $('#no').attr('value');
	if(!art_no) return false;
	
	$.ajax({
		type: "POST",
		url: "delete/",
		data: {"id": art_no, "password": password},
		dataType: "json"
	}).done(function (data) {
		if(data['success'] == 0){
			$('#delete_form').append('<span class="help-inline">' + data['error'] + '</span>').addClass('error');
		}
		else {
			location.href = '/';
		}
	});

	return false;
}
