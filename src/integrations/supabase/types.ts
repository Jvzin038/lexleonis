export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_log: {
        Row: {
          action: string | null
          created_by: string | null
          created_date: string
          details: string | null
          id: string
          module: string | null
          record_label: string | null
          updated_date: string
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          action?: string | null
          created_by?: string | null
          created_date?: string
          details?: string | null
          id?: string
          module?: string | null
          record_label?: string | null
          updated_date?: string
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string | null
          created_by?: string | null
          created_date?: string
          details?: string | null
          id?: string
          module?: string | null
          record_label?: string | null
          updated_date?: string
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      athlete: {
        Row: {
          active: boolean | null
          created_by: string | null
          created_date: string
          id: string
          name: string | null
          number: string | null
          order: number | null
          photo_url: string | null
          position: string | null
          role: string | null
          sport_id: string | null
          sport_name: string | null
          staff_role: string | null
          updated_date: string
        }
        Insert: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          id?: string
          name?: string | null
          number?: string | null
          order?: number | null
          photo_url?: string | null
          position?: string | null
          role?: string | null
          sport_id?: string | null
          sport_name?: string | null
          staff_role?: string | null
          updated_date?: string
        }
        Update: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          id?: string
          name?: string | null
          number?: string | null
          order?: number | null
          photo_url?: string | null
          position?: string | null
          role?: string | null
          sport_id?: string | null
          sport_name?: string | null
          staff_role?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      board_member: {
        Row: {
          bio: string | null
          created_by: string | null
          created_date: string
          department: string | null
          email: string | null
          id: string
          instagram: string | null
          name: string | null
          order: number | null
          photo_url: string | null
          role_title: string | null
          updated_date: string
          visible: boolean | null
        }
        Insert: {
          bio?: string | null
          created_by?: string | null
          created_date?: string
          department?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string | null
          order?: number | null
          photo_url?: string | null
          role_title?: string | null
          updated_date?: string
          visible?: boolean | null
        }
        Update: {
          bio?: string | null
          created_by?: string | null
          created_date?: string
          department?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          name?: string | null
          order?: number | null
          photo_url?: string | null
          role_title?: string | null
          updated_date?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      check_in_log: {
        Row: {
          created_by: string | null
          created_date: string
          event_id: string | null
          event_title: string | null
          holder_name: string | null
          id: string
          note: string | null
          operator_email: string | null
          operator_name: string | null
          result: string | null
          ticket_code: string | null
          ticket_id: string | null
          updated_date: string
        }
        Insert: {
          created_by?: string | null
          created_date?: string
          event_id?: string | null
          event_title?: string | null
          holder_name?: string | null
          id?: string
          note?: string | null
          operator_email?: string | null
          operator_name?: string | null
          result?: string | null
          ticket_code?: string | null
          ticket_id?: string | null
          updated_date?: string
        }
        Update: {
          created_by?: string | null
          created_date?: string
          event_id?: string | null
          event_title?: string | null
          holder_name?: string | null
          id?: string
          note?: string | null
          operator_email?: string | null
          operator_name?: string | null
          result?: string | null
          ticket_code?: string | null
          ticket_id?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      contact_message: {
        Row: {
          admin_note: string | null
          created_by: string | null
          created_date: string
          email: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          status: string | null
          subject: string | null
          type: string | null
          updated_date: string
        }
        Insert: {
          admin_note?: string | null
          created_by?: string | null
          created_date?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          subject?: string | null
          type?: string | null
          updated_date?: string
        }
        Update: {
          admin_note?: string | null
          created_by?: string | null
          created_date?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: string | null
          subject?: string | null
          type?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      event: {
        Row: {
          accessibility: string | null
          address: string | null
          age_rating: string | null
          announcement: string | null
          capacity: number | null
          category: string | null
          contact_email: string | null
          cover_url: string | null
          created_by: string | null
          created_date: string
          description: string | null
          end_date: string | null
          end_time: string | null
          featured: boolean | null
          gallery_album_id: string | null
          id: string
          location_name: string | null
          map_url: string | null
          organizer: string | null
          registration_mode: string | null
          registration_url: string | null
          require_participant_cpf: boolean | null
          require_participant_email: boolean | null
          require_participant_phone: boolean | null
          rules: string | null
          short_description: string | null
          slug: string | null
          start_date: string | null
          start_time: string | null
          status: string | null
          title: string | null
          updated_date: string
        }
        Insert: {
          accessibility?: string | null
          address?: string | null
          age_rating?: string | null
          announcement?: string | null
          capacity?: number | null
          category?: string | null
          contact_email?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          featured?: boolean | null
          gallery_album_id?: string | null
          id?: string
          location_name?: string | null
          map_url?: string | null
          organizer?: string | null
          registration_mode?: string | null
          registration_url?: string | null
          require_participant_cpf?: boolean | null
          require_participant_email?: boolean | null
          require_participant_phone?: boolean | null
          rules?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_date?: string
        }
        Update: {
          accessibility?: string | null
          address?: string | null
          age_rating?: string | null
          announcement?: string | null
          capacity?: number | null
          category?: string | null
          contact_email?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          featured?: boolean | null
          gallery_album_id?: string | null
          id?: string
          location_name?: string | null
          map_url?: string | null
          organizer?: string | null
          registration_mode?: string | null
          registration_url?: string | null
          require_participant_cpf?: boolean | null
          require_participant_email?: boolean | null
          require_participant_phone?: boolean | null
          rules?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      event_category: {
        Row: {
          active: boolean | null
          color: string | null
          created_by: string | null
          created_date: string
          id: string
          name: string | null
          order: number | null
          slug: string | null
          updated_date: string
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_by?: string | null
          created_date?: string
          id?: string
          name?: string | null
          order?: number | null
          slug?: string | null
          updated_date?: string
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_by?: string | null
          created_date?: string
          id?: string
          name?: string | null
          order?: number | null
          slug?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      faq_item: {
        Row: {
          active: boolean | null
          answer: string | null
          category: string | null
          created_by: string | null
          created_date: string
          id: string
          order: number | null
          question: string | null
          updated_date: string
        }
        Insert: {
          active?: boolean | null
          answer?: string | null
          category?: string | null
          created_by?: string | null
          created_date?: string
          id?: string
          order?: number | null
          question?: string | null
          updated_date?: string
        }
        Update: {
          active?: boolean | null
          answer?: string | null
          category?: string | null
          created_by?: string | null
          created_date?: string
          id?: string
          order?: number | null
          question?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      gallery_album: {
        Row: {
          album_date: string | null
          category: string | null
          cover_url: string | null
          created_by: string | null
          created_date: string
          credit: string | null
          description: string | null
          event_id: string | null
          event_title: string | null
          id: string
          order: number | null
          photo_count: number | null
          published: boolean | null
          title: string | null
          updated_date: string
        }
        Insert: {
          album_date?: string | null
          category?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          credit?: string | null
          description?: string | null
          event_id?: string | null
          event_title?: string | null
          id?: string
          order?: number | null
          photo_count?: number | null
          published?: boolean | null
          title?: string | null
          updated_date?: string
        }
        Update: {
          album_date?: string | null
          category?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          credit?: string | null
          description?: string | null
          event_id?: string | null
          event_title?: string | null
          id?: string
          order?: number | null
          photo_count?: number | null
          published?: boolean | null
          title?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      gallery_image: {
        Row: {
          album_id: string | null
          caption: string | null
          created_by: string | null
          created_date: string
          credit: string | null
          id: string
          order: number | null
          updated_date: string
          url: string | null
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_by?: string | null
          created_date?: string
          credit?: string | null
          id?: string
          order?: number | null
          updated_date?: string
          url?: string | null
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_by?: string | null
          created_date?: string
          credit?: string | null
          id?: string
          order?: number | null
          updated_date?: string
          url?: string | null
        }
        Relationships: []
      }
      home_section: {
        Row: {
          background: string | null
          body: string | null
          created_by: string | null
          created_date: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          item_limit: number | null
          order: number | null
          secondary_label: string | null
          secondary_url: string | null
          section_type: string | null
          subtitle: string | null
          title: string | null
          updated_date: string
          visible: boolean | null
        }
        Insert: {
          background?: string | null
          body?: string | null
          created_by?: string | null
          created_date?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          item_limit?: number | null
          order?: number | null
          secondary_label?: string | null
          secondary_url?: string | null
          section_type?: string | null
          subtitle?: string | null
          title?: string | null
          updated_date?: string
          visible?: boolean | null
        }
        Update: {
          background?: string | null
          body?: string | null
          created_by?: string | null
          created_date?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          item_limit?: number | null
          order?: number | null
          secondary_label?: string | null
          secondary_url?: string | null
          section_type?: string | null
          subtitle?: string | null
          title?: string | null
          updated_date?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      legacy_user_map: {
        Row: {
          auth_user_id: string | null
          base44_user_id: string
          data: Json | null
          email: string
          full_name: string | null
          linked_at: string | null
          role: string | null
        }
        Insert: {
          auth_user_id?: string | null
          base44_user_id: string
          data?: Json | null
          email: string
          full_name?: string | null
          linked_at?: string | null
          role?: string | null
        }
        Update: {
          auth_user_id?: string | null
          base44_user_id?: string
          data?: Json | null
          email?: string
          full_name?: string | null
          linked_at?: string | null
          role?: string | null
        }
        Relationships: []
      }
      match: {
        Row: {
          competition: string | null
          created_by: string | null
          created_date: string
          id: string
          is_home: boolean | null
          match_date: string | null
          notes: string | null
          opponent: string | null
          opponent_score: number | null
          our_score: number | null
          round: string | null
          sport_id: string | null
          sport_name: string | null
          start_time: string | null
          status: string | null
          updated_date: string
          venue: string | null
        }
        Insert: {
          competition?: string | null
          created_by?: string | null
          created_date?: string
          id?: string
          is_home?: boolean | null
          match_date?: string | null
          notes?: string | null
          opponent?: string | null
          opponent_score?: number | null
          our_score?: number | null
          round?: string | null
          sport_id?: string | null
          sport_name?: string | null
          start_time?: string | null
          status?: string | null
          updated_date?: string
          venue?: string | null
        }
        Update: {
          competition?: string | null
          created_by?: string | null
          created_date?: string
          id?: string
          is_home?: boolean | null
          match_date?: string | null
          notes?: string | null
          opponent?: string | null
          opponent_score?: number | null
          our_score?: number | null
          round?: string | null
          sport_id?: string | null
          sport_name?: string | null
          start_time?: string | null
          status?: string | null
          updated_date?: string
          venue?: string | null
        }
        Relationships: []
      }
      media_file: {
        Row: {
          category: string | null
          created_by: string | null
          created_date: string
          description: string | null
          file_type: string | null
          id: string
          name: string | null
          size_kb: number | null
          updated_date: string
          url: string | null
          used_in: string | null
        }
        Insert: {
          category?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          file_type?: string | null
          id?: string
          name?: string | null
          size_kb?: number | null
          updated_date?: string
          url?: string | null
          used_in?: string | null
        }
        Update: {
          category?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          file_type?: string | null
          id?: string
          name?: string | null
          size_kb?: number | null
          updated_date?: string
          url?: string | null
          used_in?: string | null
        }
        Relationships: []
      }
      nav_item: {
        Row: {
          created_by: string | null
          created_date: string
          external: boolean | null
          highlight: boolean | null
          id: string
          label: string | null
          location: string | null
          order: number | null
          path: string | null
          updated_date: string
          visible: boolean | null
        }
        Insert: {
          created_by?: string | null
          created_date?: string
          external?: boolean | null
          highlight?: boolean | null
          id?: string
          label?: string | null
          location?: string | null
          order?: number | null
          path?: string | null
          updated_date?: string
          visible?: boolean | null
        }
        Update: {
          created_by?: string | null
          created_date?: string
          external?: boolean | null
          highlight?: boolean | null
          id?: string
          label?: string | null
          location?: string | null
          order?: number | null
          path?: string | null
          updated_date?: string
          visible?: boolean | null
        }
        Relationships: []
      }
      order_item: {
        Row: {
          created_by: string | null
          created_date: string
          custom_name: string | null
          custom_number: string | null
          id: string
          order_id: string | null
          order_number: string | null
          product_id: string | null
          product_image: string | null
          product_name: string | null
          quantity: number | null
          size: string | null
          track_stock: boolean | null
          unit_price: number | null
          updated_date: string
          user_id: string | null
          variation: string | null
        }
        Insert: {
          created_by?: string | null
          created_date?: string
          custom_name?: string | null
          custom_number?: string | null
          id?: string
          order_id?: string | null
          order_number?: string | null
          product_id?: string | null
          product_image?: string | null
          product_name?: string | null
          quantity?: number | null
          size?: string | null
          track_stock?: boolean | null
          unit_price?: number | null
          updated_date?: string
          user_id?: string | null
          variation?: string | null
        }
        Update: {
          created_by?: string | null
          created_date?: string
          custom_name?: string | null
          custom_number?: string | null
          id?: string
          order_id?: string | null
          order_number?: string | null
          product_id?: string | null
          product_image?: string | null
          product_name?: string | null
          quantity?: number | null
          size?: string | null
          track_stock?: boolean | null
          unit_price?: number | null
          updated_date?: string
          user_id?: string | null
          variation?: string | null
        }
        Relationships: []
      }
      post: {
        Row: {
          audience: string | null
          author: string | null
          category: string | null
          content: string | null
          cover_url: string | null
          created_by: string | null
          created_date: string
          featured: boolean | null
          id: string
          published_date: string | null
          slug: string | null
          status: string | null
          subtitle: string | null
          title: string | null
          type: string | null
          updated_date: string
        }
        Insert: {
          audience?: string | null
          author?: string | null
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          featured?: boolean | null
          id?: string
          published_date?: string | null
          slug?: string | null
          status?: string | null
          subtitle?: string | null
          title?: string | null
          type?: string | null
          updated_date?: string
        }
        Update: {
          audience?: string | null
          author?: string | null
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          featured?: boolean | null
          id?: string
          published_date?: string | null
          slug?: string | null
          status?: string | null
          subtitle?: string | null
          title?: string | null
          type?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      product: {
        Row: {
          category: string | null
          created_by: string | null
          created_date: string
          customizable: boolean | null
          description: string | null
          featured: boolean | null
          id: string
          images: Json | null
          low_stock_alert: number | null
          name: string | null
          order: number | null
          preorder: boolean | null
          price: number | null
          promo_price: number | null
          sizes: Json | null
          sku: string | null
          slug: string | null
          status: string | null
          stock: number | null
          updated_date: string
          variation_label: string | null
          variations: Json | null
        }
        Insert: {
          category?: string | null
          created_by?: string | null
          created_date?: string
          customizable?: boolean | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: Json | null
          low_stock_alert?: number | null
          name?: string | null
          order?: number | null
          preorder?: boolean | null
          price?: number | null
          promo_price?: number | null
          sizes?: Json | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          updated_date?: string
          variation_label?: string | null
          variations?: Json | null
        }
        Update: {
          category?: string | null
          created_by?: string | null
          created_date?: string
          customizable?: boolean | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: Json | null
          low_stock_alert?: number | null
          name?: string | null
          order?: number | null
          preorder?: boolean | null
          price?: number | null
          promo_price?: number | null
          sizes?: Json | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          stock?: number | null
          updated_date?: string
          variation_label?: string | null
          variations?: Json | null
        }
        Relationships: []
      }
      produto_categoria: {
        Row: {
          active: boolean | null
          created_by: string | null
          created_date: string
          id: string
          name: string | null
          order: number | null
          slug: string | null
          updated_date: string
        }
        Insert: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          id?: string
          name?: string | null
          order?: number | null
          slug?: string | null
          updated_date?: string
        }
        Update: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          id?: string
          name?: string | null
          order?: number | null
          slug?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          course: string | null
          cpf: string | null
          created_date: string
          data: Json
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_date: string
        }
        Insert: {
          course?: string | null
          cpf?: string | null
          created_date?: string
          data?: Json
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_date?: string
        }
        Update: {
          course?: string | null
          cpf?: string | null
          created_date?: string
          data?: Json
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      registration: {
        Row: {
          admin_note: string | null
          asaas_payment_id: string | null
          buyer_cpf: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          code: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          confirmed_by_name: string | null
          created_by: string | null
          created_date: string
          emission_status: string | null
          event_id: string | null
          event_title: string | null
          id: string
          notes: string | null
          order_number: string | null
          participants: Json | null
          payment_method: string | null
          payment_provider: string | null
          payment_status: string | null
          pix_copy_paste: string | null
          pix_expires_at: string | null
          pix_qr_code: string | null
          quantity: number | null
          reservation_expires_at: string | null
          status: string | null
          ticket_issued: boolean | null
          ticket_type_id: string | null
          ticket_type_name: string | null
          total_amount: number | null
          unit_price: number | null
          updated_date: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          admin_note?: string | null
          asaas_payment_id?: string | null
          buyer_cpf?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_by_name?: string | null
          created_by?: string | null
          created_date?: string
          emission_status?: string | null
          event_id?: string | null
          event_title?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          participants?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          pix_copy_paste?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          quantity?: number | null
          reservation_expires_at?: string | null
          status?: string | null
          ticket_issued?: boolean | null
          ticket_type_id?: string | null
          ticket_type_name?: string | null
          total_amount?: number | null
          unit_price?: number | null
          updated_date?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          admin_note?: string | null
          asaas_payment_id?: string | null
          buyer_cpf?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          code?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_by_name?: string | null
          created_by?: string | null
          created_date?: string
          emission_status?: string | null
          event_id?: string | null
          event_title?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          participants?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          pix_copy_paste?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          quantity?: number | null
          reservation_expires_at?: string | null
          status?: string | null
          ticket_issued?: boolean | null
          ticket_type_id?: string | null
          ticket_type_name?: string | null
          total_amount?: number | null
          unit_price?: number | null
          updated_date?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          achievements_text: string | null
          address: string | null
          announcement_active: boolean | null
          announcement_text: string | null
          checkout_mode: string | null
          checkout_notice: string | null
          city: string | null
          color_deep: string | null
          color_gold: string | null
          color_ink: string | null
          color_primary: string | null
          color_surface: string | null
          contact_email: string | null
          contact_phone: string | null
          created_by: string | null
          created_date: string
          description: string | null
          entry_open_hours: number | null
          facebook: string | null
          favicon_url: string | null
          font_body: string | null
          font_heading: string | null
          footer_note: string | null
          footer_text: string | null
          history_text: string | null
          id: string
          instagram: string | null
          logo_light_url: string | null
          logo_url: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          maintenance_title: string | null
          map_url: string | null
          mission_text: string | null
          order_whatsapp_intro: string | null
          payment_instructions: string | null
          pix_key: string | null
          projects_text: string | null
          published_version: string | null
          require_phone_on_order: boolean | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          short_name: string | null
          site_name: string | null
          symbols_text: string | null
          tagline: string | null
          ticket_valid_hours_after_end: number | null
          tiktok: string | null
          updated_date: string
          values_text: string | null
          whatsapp: string | null
          x_url: string | null
          youtube: string | null
        }
        Insert: {
          achievements_text?: string | null
          address?: string | null
          announcement_active?: boolean | null
          announcement_text?: string | null
          checkout_mode?: string | null
          checkout_notice?: string | null
          city?: string | null
          color_deep?: string | null
          color_gold?: string | null
          color_ink?: string | null
          color_primary?: string | null
          color_surface?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          entry_open_hours?: number | null
          facebook?: string | null
          favicon_url?: string | null
          font_body?: string | null
          font_heading?: string | null
          footer_note?: string | null
          footer_text?: string | null
          history_text?: string | null
          id?: string
          instagram?: string | null
          logo_light_url?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          maintenance_title?: string | null
          map_url?: string | null
          mission_text?: string | null
          order_whatsapp_intro?: string | null
          payment_instructions?: string | null
          pix_key?: string | null
          projects_text?: string | null
          published_version?: string | null
          require_phone_on_order?: boolean | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_name?: string | null
          site_name?: string | null
          symbols_text?: string | null
          tagline?: string | null
          ticket_valid_hours_after_end?: number | null
          tiktok?: string | null
          updated_date?: string
          values_text?: string | null
          whatsapp?: string | null
          x_url?: string | null
          youtube?: string | null
        }
        Update: {
          achievements_text?: string | null
          address?: string | null
          announcement_active?: boolean | null
          announcement_text?: string | null
          checkout_mode?: string | null
          checkout_notice?: string | null
          city?: string | null
          color_deep?: string | null
          color_gold?: string | null
          color_ink?: string | null
          color_primary?: string | null
          color_surface?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          entry_open_hours?: number | null
          facebook?: string | null
          favicon_url?: string | null
          font_body?: string | null
          font_heading?: string | null
          footer_note?: string | null
          footer_text?: string | null
          history_text?: string | null
          id?: string
          instagram?: string | null
          logo_light_url?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          maintenance_title?: string | null
          map_url?: string | null
          mission_text?: string | null
          order_whatsapp_intro?: string | null
          payment_instructions?: string | null
          pix_key?: string | null
          projects_text?: string | null
          published_version?: string | null
          require_phone_on_order?: boolean | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_name?: string | null
          site_name?: string | null
          symbols_text?: string | null
          tagline?: string | null
          ticket_valid_hours_after_end?: number | null
          tiktok?: string | null
          updated_date?: string
          values_text?: string | null
          whatsapp?: string | null
          x_url?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      sponsor: {
        Row: {
          active: boolean | null
          benefit: string | null
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_by: string | null
          created_date: string
          description: string | null
          id: string
          logo_url: string | null
          name: string | null
          order: number | null
          promo_code: string | null
          tier: string | null
          updated_date: string
          valid_until: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean | null
          benefit?: string | null
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          order?: number | null
          promo_code?: string | null
          tier?: string | null
          updated_date?: string
          valid_until?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean | null
          benefit?: string | null
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          order?: number | null
          promo_code?: string | null
          tier?: string | null
          updated_date?: string
          valid_until?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      sport: {
        Row: {
          active: boolean | null
          coach: string | null
          competition: string | null
          created_by: string | null
          created_date: string
          description: string | null
          id: string
          image_url: string | null
          name: string | null
          order: number | null
          slug: string | null
          training_schedule: string | null
          updated_date: string
          venue: string | null
        }
        Insert: {
          active?: boolean | null
          coach?: string | null
          competition?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          order?: number | null
          slug?: string | null
          training_schedule?: string | null
          updated_date?: string
          venue?: string | null
        }
        Update: {
          active?: boolean | null
          coach?: string | null
          competition?: string | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string | null
          order?: number | null
          slug?: string | null
          training_schedule?: string | null
          updated_date?: string
          venue?: string | null
        }
        Relationships: []
      }
      staff_profile: {
        Row: {
          active: boolean | null
          created_by: string | null
          created_date: string
          id: string
          invited_at: string | null
          invited_by: string | null
          invited_by_name: string | null
          note: string | null
          permissions: Json | null
          phone: string | null
          roles: Json | null
          updated_date: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_by_name?: string | null
          note?: string | null
          permissions?: Json | null
          phone?: string | null
          roles?: Json | null
          updated_date?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_by_name?: string | null
          note?: string | null
          permissions?: Json | null
          phone?: string | null
          roles?: Json | null
          updated_date?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      standing: {
        Row: {
          competition: string | null
          created_by: string | null
          created_date: string
          draws: number | null
          id: string
          is_our_team: boolean | null
          losses: number | null
          played: number | null
          points: number | null
          position: number | null
          sport_id: string | null
          team_name: string | null
          updated_date: string
          wins: number | null
        }
        Insert: {
          competition?: string | null
          created_by?: string | null
          created_date?: string
          draws?: number | null
          id?: string
          is_our_team?: boolean | null
          losses?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          sport_id?: string | null
          team_name?: string | null
          updated_date?: string
          wins?: number | null
        }
        Update: {
          competition?: string | null
          created_by?: string | null
          created_date?: string
          draws?: number | null
          id?: string
          is_our_team?: boolean | null
          losses?: number | null
          played?: number | null
          points?: number | null
          position?: number | null
          sport_id?: string | null
          team_name?: string | null
          updated_date?: string
          wins?: number | null
        }
        Relationships: []
      }
      static_page: {
        Row: {
          content: string | null
          cover_url: string | null
          created_by: string | null
          created_date: string
          excerpt: string | null
          id: string
          order: number | null
          seo_description: string | null
          seo_title: string | null
          show_in_footer: boolean | null
          slug: string | null
          status: string | null
          system_key: string | null
          title: string | null
          updated_date: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          excerpt?: string | null
          id?: string
          order?: number | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_footer?: boolean | null
          slug?: string | null
          status?: string | null
          system_key?: string | null
          title?: string | null
          updated_date?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_by?: string | null
          created_date?: string
          excerpt?: string | null
          id?: string
          order?: number | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_footer?: boolean | null
          slug?: string | null
          status?: string | null
          system_key?: string | null
          title?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      store_order: {
        Row: {
          admin_note: string | null
          asaas_payment_id: string | null
          buyer_cpf: string | null
          cancel_reason: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          confirmed_by_name: string | null
          contact_phone: string | null
          created_by: string | null
          created_date: string
          fulfillment_method: string | null
          id: string
          items_count: number | null
          items_label: string | null
          order_number: string | null
          payment_method: string | null
          payment_provider: string | null
          payment_status: string | null
          pickup_note: string | null
          pix_copy_paste: string | null
          pix_expires_at: string | null
          pix_qr_code: string | null
          reservation_expires_at: string | null
          shipping_city: string | null
          shipping_complement: string | null
          shipping_neighborhood: string | null
          shipping_number: string | null
          shipping_state: string | null
          shipping_street: string | null
          shipping_zip: string | null
          status: string | null
          stock_released: boolean | null
          total_amount: number | null
          updated_date: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          admin_note?: string | null
          asaas_payment_id?: string | null
          buyer_cpf?: string | null
          cancel_reason?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_by_name?: string | null
          contact_phone?: string | null
          created_by?: string | null
          created_date?: string
          fulfillment_method?: string | null
          id?: string
          items_count?: number | null
          items_label?: string | null
          order_number?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          pickup_note?: string | null
          pix_copy_paste?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          reservation_expires_at?: string | null
          shipping_city?: string | null
          shipping_complement?: string | null
          shipping_neighborhood?: string | null
          shipping_number?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          shipping_zip?: string | null
          status?: string | null
          stock_released?: boolean | null
          total_amount?: number | null
          updated_date?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          admin_note?: string | null
          asaas_payment_id?: string | null
          buyer_cpf?: string | null
          cancel_reason?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_by_name?: string | null
          contact_phone?: string | null
          created_by?: string | null
          created_date?: string
          fulfillment_method?: string | null
          id?: string
          items_count?: number | null
          items_label?: string | null
          order_number?: string | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          pickup_note?: string | null
          pix_copy_paste?: string | null
          pix_expires_at?: string | null
          pix_qr_code?: string | null
          reservation_expires_at?: string | null
          shipping_city?: string | null
          shipping_complement?: string | null
          shipping_neighborhood?: string | null
          shipping_number?: string | null
          shipping_state?: string | null
          shipping_street?: string | null
          shipping_zip?: string | null
          status?: string | null
          stock_released?: boolean | null
          total_amount?: number | null
          updated_date?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      ticket: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          checked_in_by_name: string | null
          code: string | null
          created_by: string | null
          created_date: string
          event_date: string | null
          event_end_at: string | null
          event_id: string | null
          event_location: string | null
          event_start_time: string | null
          event_title: string | null
          holder_name: string | null
          id: string
          issued_at: string | null
          order_number: string | null
          participant_cpf: string | null
          participant_email: string | null
          participant_name: string | null
          participant_phone: string | null
          payment_status: string | null
          registration_id: string | null
          revoked_reason: string | null
          status: string | null
          ticket_type_name: string | null
          updated_date: string
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_in_by_name?: string | null
          code?: string | null
          created_by?: string | null
          created_date?: string
          event_date?: string | null
          event_end_at?: string | null
          event_id?: string | null
          event_location?: string | null
          event_start_time?: string | null
          event_title?: string | null
          holder_name?: string | null
          id?: string
          issued_at?: string | null
          order_number?: string | null
          participant_cpf?: string | null
          participant_email?: string | null
          participant_name?: string | null
          participant_phone?: string | null
          payment_status?: string | null
          registration_id?: string | null
          revoked_reason?: string | null
          status?: string | null
          ticket_type_name?: string | null
          updated_date?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_in_by_name?: string | null
          code?: string | null
          created_by?: string | null
          created_date?: string
          event_date?: string | null
          event_end_at?: string | null
          event_id?: string | null
          event_location?: string | null
          event_start_time?: string | null
          event_title?: string | null
          holder_name?: string | null
          id?: string
          issued_at?: string | null
          order_number?: string | null
          participant_cpf?: string | null
          participant_email?: string | null
          participant_name?: string | null
          participant_phone?: string | null
          payment_status?: string | null
          registration_id?: string | null
          revoked_reason?: string | null
          status?: string | null
          ticket_type_name?: string | null
          updated_date?: string
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      ticket_type: {
        Row: {
          active: boolean | null
          created_by: string | null
          created_date: string
          description: string | null
          event_id: string | null
          event_title: string | null
          id: string
          is_free: boolean | null
          max_per_buyer: number | null
          name: string | null
          next_batch_id: string | null
          order: number | null
          price: number | null
          quantity_reserved: number | null
          quantity_sold: number | null
          quantity_total: number | null
          rotation_mode: string | null
          sales_end: string | null
          sales_start: string | null
          updated_date: string
        }
        Insert: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          event_id?: string | null
          event_title?: string | null
          id?: string
          is_free?: boolean | null
          max_per_buyer?: number | null
          name?: string | null
          next_batch_id?: string | null
          order?: number | null
          price?: number | null
          quantity_reserved?: number | null
          quantity_sold?: number | null
          quantity_total?: number | null
          rotation_mode?: string | null
          sales_end?: string | null
          sales_start?: string | null
          updated_date?: string
        }
        Update: {
          active?: boolean | null
          created_by?: string | null
          created_date?: string
          description?: string | null
          event_id?: string | null
          event_title?: string | null
          id?: string
          is_free?: boolean | null
          max_per_buyer?: number | null
          name?: string | null
          next_batch_id?: string | null
          order?: number | null
          price?: number | null
          quantity_reserved?: number | null
          quantity_sold?: number | null
          quantity_total?: number | null
          rotation_mode?: string | null
          sales_end?: string | null
          sales_start?: string | null
          updated_date?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      entity_update_many: {
        Args: { filter: Json; inc_values: Json; set_values: Json; t: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
