function set_corr_matrix_svg_visual() {
    if(document.getElementById('analysis_corr_matrix_svg').style.display == 'inline'){
        document.getElementById('analysis_corr_matrix_svg').style.display = 'none';
        document.getElementById('analysis_corr_matrix_info').style.display = 'none';
        document.getElementById('analysis_attributions_analysis_svg').style.display = 'inline';
        document.getElementById('analysis_corr_force_info').style.display = 'inline';
    }
    else{
        document.getElementById('analysis_attributions_analysis_svg').style.display = 'none';
        document.getElementById('analysis_corr_force_info').style.display = 'none';
        document.getElementById('analysis_corr_matrix_svg').style.display = 'inline';
        document.getElementById('analysis_corr_matrix_info').style.display = 'inline';
    }
}