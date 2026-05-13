<?php
/**
 * Header Template - Enhanced with modern styling and navigation
 * 
 * @package Elegant_Parlor
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php bloginfo('description'); ?>">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <?php wp_body_open(); ?>
    
    <header class="site-header" id="site-header">
        <div class="header-container container">
            <!-- Logo -->
            <div class="site-branding">
                <a href="<?php echo esc_url(home_url('/')); ?>" class="brand-link">
                    <?php
                    $logo_id = get_theme_mod('elegant_parlor_logo');
                    if ($logo_id) {
                        echo wp_get_attachment_image($logo_id, 'thumbnail', false, array('class' => 'logo-image'));
                    }
                    ?>
                    <span class="brand-text"><?php bloginfo('name'); ?></span>
                </a>
            </div>
            
            <!-- Navigation Menu -->
            <nav class="site-nav" id="main-nav">
                <?php
                wp_nav_menu(array(
                    'theme_location' => 'primary',
                    'container' => false,
                    'fallback_cb' => function() {
                        ?>
                        <a href="<?php echo home_url(); ?>" class="nav-link">Home</a>
                        <a href="<?php echo home_url('/#services'); ?>" class="nav-link">Services</a>
                        <a href="<?php echo home_url('/#testimonials'); ?>" class="nav-link">Reviews</a>
                        <a href="<?php echo home_url('/#contact'); ?>" class="nav-link">Contact</a>
                        <?php
                    },
                    'menu_class' => 'nav-menu',
                    'link_before' => '<span>',
                    'link_after' => '</span>',
                    'depth' => 1,
                ));
                ?>
                
                <!-- Social Links in Header -->
                <?php
                $social = json_decode(get_option('parlor_social_links', '{}'), true);
                if (!empty($social['whatsapp'])) {
                    $whatsapp_link = 'https://wa.me/' . preg_replace('/[^0-9]/', '', $social['whatsapp']);
                    ?>
                    <a href="<?php echo esc_url($whatsapp_link); ?>" target="_blank" rel="noopener noreferrer" class="social-icon whatsapp" title="WhatsApp">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.385 0-2.722.474-3.802 1.331-.949.747-1.553 1.771-1.62 2.857-.031.547.066 1.095.2 1.623.124.463.354.917.754 1.288.401.372.944.649 1.494.888.539.236 1.11.426 1.694.556.287.062.576.093.866.093 1.366 0 2.68-.454 3.747-1.317.95-.762 1.543-1.81 1.605-2.92.028-.531-.066-1.09-.192-1.636-.12-.469-.343-.941-.745-1.316-.402-.376-.945-.657-1.497-.897-.541-.237-1.115-.426-1.698-.556-.29-.063-.58-.095-.872-.093z"/></svg>
                    </a>
                    <?php
                }
                ?>
            </nav>

            <!-- Mobile Menu Toggle -->
            <button class="menu-toggle" id="menu-toggle" aria-label="Toggle Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
            
            <!-- CTA Buttons: Book + Admin -->
            <div class="header-ctas">
                <a href="<?php echo home_url('/#booking'); ?>" class="btn-book-now">Book Now</a>
                <a href="<?php echo esc_url(admin_url()); ?>" class="btn-admin" title="Admin Login">Admin</a>
            </div>
            </div>
        <script>
    (function() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const mainNav = document.getElementById('main-nav');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                mainNav?.classList.toggle('mobile-menu-visible');
                this.classList.toggle('active');
            });
        }

        // Header scroll effect
        const header = document.getElementById('site-header');
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && document.querySelector(href)) {
                    e.preventDefault();
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                    mainNav?.classList.remove('mobile-menu-visible');
                    menuToggle?.classList.remove('active');
                }
            });
        });
    })();
    </script>

    </header>

    <?php
    // Frontpage hero: prefers uploaded video, falls back to image
    if (is_front_page() || is_home()) :
        $hero_video = get_option('parlor_hero_video_url');
        $hero_image = get_option('parlor_hero_image_url');
        $hero_title = get_option('parlor_business_title', get_bloginfo('name'));
        $hero_sub = get_option('parlor_business_description', '');
        ?>
        <section class="site-hero" id="hero">
            <?php if ($hero_image): ?>
                <div class="hero-image" style="background-image: url('<?php echo esc_url($hero_image); ?>')"></div>
            <?php endif; ?>
            <?php if ($hero_video): ?>
                <video autoplay muted loop playsinline class="hero-video" preload="metadata">
                    <source src="<?php echo esc_url($hero_video); ?>" type="video/mp4">
                </video>
            <?php endif; ?>

            <div class="hero-content container">
                <h1 class="hero-title"><?php echo wp_kses_post($hero_title); ?></h1>
                <?php if ($hero_sub): ?><p class="hero-sub"><?php echo wp_kses_post($hero_sub); ?></p><?php endif; ?>
                <div class="hero-ctas">
                    <?php $hero_cta_text = get_option('parlor_hero_cta_text', 'Book Now'); $hero_cta_link = get_option('parlor_hero_cta_link', '#booking'); ?>
                    <a href="<?php echo esc_url($hero_cta_link); ?>" class="btn btn-primary"><?php echo esc_html($hero_cta_text); ?></a>
                </div>
            </div>
        </section>
    <?php endif; ?>

    <script>
        (function(){
            // Hide only on hard video failure; do not hide while buffering.
            var hero = document.getElementById('hero');
            if (!hero) return;
            var vid = hero.querySelector('.hero-video');
            if (!vid) return;

            function fallback() {
                try { vid.style.display = 'none'; } catch(e){}
                hero.classList.add('hero-video-failed');
            }

            function showVideo() {
                try { vid.style.display = 'block'; } catch(e){}
                hero.classList.remove('hero-video-failed');
            }

            vid.addEventListener('error', fallback);
            vid.addEventListener('loadeddata', showVideo);
            vid.addEventListener('canplay', showVideo);
            // networkState 3 === NETWORK_NO_SOURCE
            if (vid.networkState === 3) fallback();
            if (vid.readyState >= 2) showVideo();
        })();
    </script>

    <main id="main" class="site-main">