import { supabase } from "../../../lib/supabase";

export async function listRoutes(filters = {}) {
  let query = supabase
    .from("routes")
    .select(`
      *,
      route_responsible:route_responsible_id(id, name, registration),
      departure_location:departure_location_id(id, name)
    `)
    .order("route_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) {
    const search = filters.search.trim();
    query = query.or(
      `route_responsible_manual_name.ilike.%${search}%,route_responsible_manual_registration.ilike.%${search}%,notes.ilike.%${search}%`
    );
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.route_date) {
    query = query.eq("route_date", filters.route_date);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Não foi possível carregar as rotas.");
  }

  return data || [];
}

export async function getRouteById(id) {
  const { data, error } = await supabase
    .from("routes")
    .select(`
      *,
      route_responsible:route_responsible_id(id, name, registration),
      departure_location:departure_location_id(id, name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível carregar a rota.");
  }

  return data;
}

export async function listRouteStops(routeId) {
  const { data, error } = await supabase
    .from("route_stops")
    .select(`
      *,
      location:location_id(id, name)
    `)
    .eq("route_id", routeId)
    .order("stop_order", { ascending: true });

  if (error) {
    throw new Error(error.message || "Não foi possível carregar as paradas da rota.");
  }

  return data || [];
}

export async function createRoute(payload) {
  const { stops = [], ...routePayload } = payload;

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .insert([
      {
        route_date: routePayload.route_date,
        route_responsible_id: routePayload.route_responsible_id || null,
        route_responsible_manual_name:
          routePayload.route_responsible_manual_name || null,
        route_responsible_manual_registration:
          routePayload.route_responsible_manual_registration || null,
        departure_location_id: routePayload.departure_location_id || null,
        status: routePayload.status || "planned",
        notes: routePayload.notes || null,
      },
    ])
    .select()
    .single();

  if (routeError) {
    throw new Error(routeError.message || "Não foi possível criar a rota.");
  }

  if (stops.length > 0) {
    const stopsPayload = stops
      .filter((item) => item.location_id)
      .map((item, index) => ({
        route_id: route.id,
        location_id: item.location_id,
        stop_order: index + 1,
        notes: item.notes || null,
      }));

    if (stopsPayload.length > 0) {
      const { error: stopsError } = await supabase
        .from("route_stops")
        .insert(stopsPayload);

      if (stopsError) {
        throw new Error(
          stopsError.message ||
            "A rota foi criada, mas houve erro ao salvar as paradas."
        );
      }
    }
  }

  return route;
}

export async function updateRoute(id, payload) {
  const { stops = [], ...routePayload } = payload;

  const { data: route, error: routeError } = await supabase
    .from("routes")
    .update({
      route_date: routePayload.route_date,
      route_responsible_id: routePayload.route_responsible_id || null,
      route_responsible_manual_name:
        routePayload.route_responsible_manual_name || null,
      route_responsible_manual_registration:
        routePayload.route_responsible_manual_registration || null,
      departure_location_id: routePayload.departure_location_id || null,
      status: routePayload.status || "planned",
      notes: routePayload.notes || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (routeError) {
    throw new Error(routeError.message || "Não foi possível atualizar a rota.");
  }

  const { error: deleteStopsError } = await supabase
    .from("route_stops")
    .delete()
    .eq("route_id", id);

  if (deleteStopsError) {
    throw new Error(
      deleteStopsError.message ||
        "A rota foi atualizada, mas houve erro ao limpar as paradas."
    );
  }

  const stopsPayload = stops
    .filter((item) => item.location_id)
    .map((item, index) => ({
      route_id: id,
      location_id: item.location_id,
      stop_order: index + 1,
      notes: item.notes || null,
    }));

  if (stopsPayload.length > 0) {
    const { error: insertStopsError } = await supabase
      .from("route_stops")
      .insert(stopsPayload);

    if (insertStopsError) {
      throw new Error(
        insertStopsError.message ||
          "A rota foi atualizada, mas houve erro ao salvar as paradas."
      );
    }
  }

  return route;
}

export async function updateRouteStatus(id, status) {
  const { data, error } = await supabase
    .from("routes")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível alterar o status da rota.");
  }

  return data;
}