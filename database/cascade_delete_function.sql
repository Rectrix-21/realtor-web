-- Create a function to safely delete a property and all related records
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_property_cascade(property_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_property JSON;
    viewing_count INTEGER;
    bookmark_count INTEGER;
BEGIN
    -- Count related records first
    SELECT COUNT(*) INTO viewing_count 
    FROM "ViewingRequests" 
    WHERE property_id = property_id_param;
    
    SELECT COUNT(*) INTO bookmark_count 
    FROM "Bookmarks" 
    WHERE property_id = property_id_param;
    
    -- Delete related viewing requests
    DELETE FROM "ViewingRequests" 
    WHERE property_id = property_id_param;
    
    -- Delete related bookmarks
    DELETE FROM "Bookmarks" 
    WHERE property_id = property_id_param;
    
    -- Delete the property and return the deleted record
    DELETE FROM "Property" 
    WHERE property_id = property_id_param
    RETURNING row_to_json("Property".*) INTO deleted_property;
    
    -- Return success message with counts
    RETURN json_build_object(
        'success', true,
        'deleted_property', deleted_property,
        'deleted_viewing_requests', viewing_count,
        'deleted_bookmarks', bookmark_count,
        'message', 'Property and all related records deleted successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to delete property'
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_property_cascade(UUID) TO authenticated;
